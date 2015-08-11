module.exports = React.createClass({
  onDrop (event) {
    var zone = React.findDOMNode(this.refs.dropZone);
    zone.classList.remove('hover');

    var file = event.dataTransfer.files[0];
    if(file.type === ""){
      var directory = file.path;
      console.log(directory);
    } else {
      // TODO: it's directory?
    }
  },

  onDragOver () {
    var zone = React.findDOMNode(this.refs.dropZone);
    zone.classList.add('hover');
  },

  onDragLeave () {
    var zone = React.findDOMNode(this.refs.dropZone);
    zone.classList.remove('hover');
  },

  onOpenClick: function () {
  },

  render () {
    return (
      <div id={"dropzone-container"}>
        <div id={"dropzone"} ref="dropZone" onDragLeave={this.onDragLeave} onDragOver={this.onDragOver} onDrop={this.onDrop}>
          <img src="./images/git.png" alt="" />
          <p>Drag a repository here</p>
        </div>
        <p>or</p>
        <button type={"file"}>Open repository...</button>
      </div>
    )
  }
})
