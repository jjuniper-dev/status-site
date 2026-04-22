// Bridge: make existing editor work with dashboard active document
(function(){
  function getDoc(){return window.currentIntelligenceDocument || {path:'intelligence/platform-intelligence.md',slug:'default',title:'Document'}}

  // patch draft storage per document
  const origLoad = IntelligenceEditor.prototype.loadDraft;
  IntelligenceEditor.prototype.getDraftKey = function(){return 'draft__'+getDoc().slug};

  IntelligenceEditor.prototype.loadDraft = function(){
    const stored = localStorage.getItem(this.getDraftKey());
    if(stored){
      const d = JSON.parse(stored);
      this.state.draftContent = d.content || '';
      document.getElementById('editor-textarea').value = this.state.draftContent;
      this.updatePreview();
    }
  };

  IntelligenceEditor.prototype.saveDraft = function(){
    if(!this.state.isDraft) return;
    localStorage.setItem(this.getDraftKey(), JSON.stringify({content:this.state.draftContent}));
  };

  // patch publish target
  IntelligenceEditor.prototype.publish = async function(){
    const doc = getDoc();
    const token = localStorage.getItem('github_token');
    if(!token){alert('Need GitHub token');return}

    const owner='jjuniper-dev';
    const repo='status-site';
    const branch='intelligence-draft';
    const path=doc.path;

    const content=btoa(this.state.draftContent);

    await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`,{
      method:'PUT',
      headers:{'Authorization':`token ${token}`,'Content-Type':'application/json'},
      body:JSON.stringify({message:`Update ${doc.title}`,content,branch})
    });

    alert('Published to '+path);
    this.closeEditor();
    if(window.dashboard && window.dashboard.render) window.dashboard.render();
  };
})();
