import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import CreateDatasetPage from "./Dataset/CreateDatasetPage";
import CreateModelPage from "./Model/CreateModelPage";
import ViewAllDatasets from "./Dataset/ViewAllDatasets";
import ViewAllModels from "./Model/ViewAllModels";
import EditDataset from "./Dataset/EditDataset";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Navbar>
        <Switch>
          <Route path="/dataset/create">
            <CreateDatasetPage />
          </Route>
          <Route path="/dataset/edit">
            <EditDataset />
          </Route>
          <Route path="/dataset" exact>
            <ViewAllDatasets />
          </Route>
          <Route path="/model" exact>
            <ViewAllModels />
          </Route>
          <Route path="/model/create" exact>
            <CreateModelPage />
          </Route>
        </Switch>
      </Navbar>
    </Router>
  );
}

export default App;
