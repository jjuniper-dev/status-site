"""
Scheduler for managing connector jobs and ingestion orchestration.
Uses APScheduler for scheduling and job management.
"""

import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from base_connector import BaseConnector, IngestionResult

logger = logging.getLogger(__name__)


class ConnectorScheduler:
    """
    Manages scheduled ingestion jobs for data connectors.
    Handles job creation, scheduling, error tracking, and history.
    """

    def __init__(self, storage_dir: str = ".graphrag/connectors"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)

        self.scheduler = AsyncIOScheduler()
        self.connectors: Dict[str, BaseConnector] = {}
        self.ingestion_history: List[IngestionResult] = []
        self.graphrag_client = None

    async def initialize(self, graphrag_client):
        """Initialize scheduler with GraphRAG client"""
        self.graphrag_client = graphrag_client

        # Load persisted connectors from storage
        await self._load_connectors()

        # Start scheduler
        if not self.scheduler.running:
            self.scheduler.start()
            logger.info("Scheduler started")

    async def shutdown(self):
        """Gracefully shutdown scheduler"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            logger.info("Scheduler stopped")

    async def register_connector(self, connector: BaseConnector) -> str:
        """
        Register a connector and schedule its jobs.

        Args:
            connector: BaseConnector instance

        Returns:
            Connector ID
        """
        connector_id = connector.name
        self.connectors[connector_id] = connector

        # Test connection
        try:
            connected = await connector.test_connection()
            if not connected:
                raise Exception("Connection test failed")
            logger.info(f"Connector {connector_id} registered and tested")
        except Exception as e:
            logger.error(f"Connector {connector_id} test failed: {str(e)}")
            raise

        # Schedule jobs if not manual
        if connector.config.schedule != "manual":
            self._schedule_connector_job(connector_id, connector.config.schedule)

        # Persist configuration
        await self._save_connector_config(connector_id, connector.get_config_dict())

        return connector_id

    def _schedule_connector_job(self, connector_id: str, schedule: str):
        """Schedule a connector job based on cron expression"""
        try:
            trigger = CronTrigger.from_crontab(schedule)

            self.scheduler.add_job(
                self._run_ingestion,
                trigger=trigger,
                args=[connector_id],
                id=f"ingest_{connector_id}",
                name=f"Ingest {connector_id}",
                replace_existing=True,
                max_instances=1,  # Only one instance at a time
            )

            logger.info(f"Scheduled {connector_id} with cron: {schedule}")
        except Exception as e:
            logger.error(f"Failed to schedule {connector_id}: {str(e)}")
            raise

    async def _run_ingestion(self, connector_id: str):
        """Run ingestion for a connector"""
        if connector_id not in self.connectors:
            logger.error(f"Connector {connector_id} not found")
            return

        connector = self.connectors[connector_id]
        logger.info(f"Starting ingestion for {connector_id}")

        try:
            result = await connector.ingest(self.graphrag_client)
            self.ingestion_history.append(result)

            if result.status == "success":
                logger.info(f"Ingestion {connector_id} complete: {result.records_ingested} records")
            else:
                logger.warning(
                    f"Ingestion {connector_id} {result.status}: "
                    f"{result.records_ingested}/{result.records_processed} records, "
                    f"{len(result.errors)} errors"
                )

            # Persist result
            await self._save_ingestion_result(result)

        except Exception as e:
            logger.error(f"Ingestion {connector_id} failed: {str(e)}")
            result = IngestionResult(
                connector_name=connector_id,
                status="failed",
                errors=[str(e)]
            )
            self.ingestion_history.append(result)

    async def run_ingestion_manual(self, connector_id: str) -> IngestionResult:
        """Manually trigger ingestion for a connector"""
        await self._run_ingestion(connector_id)

        # Return latest result
        for result in reversed(self.ingestion_history):
            if result.connector_name == connector_id:
                return result

        return IngestionResult(
            connector_name=connector_id,
            status="failed",
            errors=["No result found"]
        )

    async def unregister_connector(self, connector_id: str):
        """Remove a connector and cancel its jobs"""
        if connector_id not in self.connectors:
            raise ValueError(f"Connector {connector_id} not found")

        # Cancel scheduled job
        job_id = f"ingest_{connector_id}"
        try:
            self.scheduler.remove_job(job_id)
        except:
            pass  # Job might not be scheduled

        # Remove connector
        del self.connectors[connector_id]

        # Remove persisted config
        config_path = self.storage_dir / f"{connector_id}.json"
        config_path.unlink(missing_ok=True)

        logger.info(f"Connector {connector_id} unregistered")

    def get_connector(self, connector_id: str) -> Optional[BaseConnector]:
        """Get a connector by ID"""
        return self.connectors.get(connector_id)

    def list_connectors(self) -> List[Dict[str, Any]]:
        """List all registered connectors with status"""
        return [
            {
                "id": cid,
                "status": connector.get_status_info(),
                "scheduled": any(job.id == f"ingest_{cid}" for job in self.scheduler.get_jobs())
            }
            for cid, connector in self.connectors.items()
        ]

    def get_ingestion_history(
        self, connector_id: Optional[str] = None, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get recent ingestion results"""
        history = self.ingestion_history

        if connector_id:
            history = [r for r in history if r.connector_name == connector_id]

        # Most recent first, limited
        return [
            {
                "connector_name": r.connector_name,
                "status": r.status,
                "records_processed": r.records_processed,
                "records_ingested": r.records_ingested,
                "errors": r.errors,
                "start_time": r.start_time.isoformat() if r.start_time else None,
                "end_time": r.end_time.isoformat() if r.end_time else None,
                "duration_seconds": (
                    (r.end_time - r.start_time).total_seconds()
                    if r.start_time and r.end_time
                    else None
                )
            }
            for r in reversed(history[-limit:])
        ]

    async def _save_connector_config(self, connector_id: str, config: Dict):
        """Persist connector configuration to disk"""
        config_path = self.storage_dir / f"{connector_id}.json"
        config_path.write_text(json.dumps(config, indent=2))

    async def _load_connectors(self):
        """Load persisted connectors from storage"""
        # This would load saved connector configs and re-register them
        # For now, just log that we're ready to load
        config_files = list(self.storage_dir.glob("*.json"))
        logger.info(f"Found {len(config_files)} persisted connectors")

    async def _save_ingestion_result(self, result: IngestionResult):
        """Persist ingestion result for audit trail"""
        history_dir = self.storage_dir / "history"
        history_dir.mkdir(exist_ok=True)

        timestamp = datetime.utcnow().isoformat()
        result_path = history_dir / f"{result.connector_name}_{timestamp}.json"

        result_data = {
            "connector_name": result.connector_name,
            "status": result.status,
            "records_processed": result.records_processed,
            "records_ingested": result.records_ingested,
            "errors": result.errors,
            "start_time": result.start_time.isoformat() if result.start_time else None,
            "end_time": result.end_time.isoformat() if result.end_time else None,
        }

        result_path.write_text(json.dumps(result_data, indent=2))


# Global scheduler instance
_scheduler = None


def get_scheduler() -> ConnectorScheduler:
    """Get or create global scheduler instance"""
    global _scheduler
    if _scheduler is None:
        _scheduler = ConnectorScheduler()
    return _scheduler
