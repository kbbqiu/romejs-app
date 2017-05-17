import React, {Component} from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { dialog, remote } from  'electron';
import Nav from './Nav';
import Home from './Home';
import Graph from './Graph';
import Editor from './Editor';
import Dashboard from './Dashboard';
import Blank from './Blank';
import componentParser from './../../componentParser/componentParser.js';
import path from 'path';
import fs from 'fs';

let index;
if (window.location.pathname.includes('/index.html')) index = window.location.pathname;

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      filename: null,
      filepath: null
    }
    this.openFile = this.openFile.bind(this);
    this.fileTree = this.fileTree.bind(this);
    this.selectedFile = this.selectedFile.bind(this);
  }

  openFile(callback) {
    let componentData;
    let filename;
    remote.dialog.showOpenDialog({ properties: [ 'openFile'], filters: [{ name: 'JavaScript', extensions: ['js', 'jsx'] }]}, (file) => {
      componentData = componentParser.ASTParser(file[0]);
      filename = file[0];
      let filepath = filename.split('/');
      filepath.pop();
      filepath = filepath.join('/');
      this.setState({
        filename: filename,
        filepath: filepath
      })
      fs.writeFileSync('app/js/graph.js', 'const data = ' + JSON.stringify(componentData, null, 2));
      callback();
    });
  }

  fileTree(filename) {
    const info = {
      text: path.basename(filename),
      color: "#9d9d9d"
    }
    if (fs.lstatSync(filename).isDirectory()) {
      info.nodes = fs.readdirSync(filename).map(child => this.fileTree(`${filename}/${child}`));
    }
    return info;
  }

  selectedFile(file) {
    this.setState({
      filename: this.state.filepath + '/' + file
    })
  }

  render() {
    return (
      <Router>
        <div id="wrapper">
          <Route render={(props) => (
            <Nav {...props} fileTree={this.fileTree} filename={this.state.filename} filepath={this.state.filepath} selectedFile={this.selectedFile}/>
          )}/>
          <Route exact path={index} render={(props) => (
            <Home {...props} openFile={this.openFile} />
          )}/>
          <Route path="/home" render={(props) => (
            <Home {...props} openFile={this.openFile} />
          )}/>
          <Route path="/graph" component={Graph}/>
          <Route path="/editor" render={(props) => (
            <Editor {...props} index={index} filename={this.state.filename} />
          )}/>
          <Route path="/dashboard" component={Dashboard}/>
          <Route path="/blank" render={(props) => (
            <Blank {...props} index={index} filename={this.state.filename} />
          )}/>
        </div>
      </Router>
    );
  }
};

export default App;