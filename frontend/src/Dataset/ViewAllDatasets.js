import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Typography,
  ListItemSecondaryAction,
  ListItem,
  ListItemAvatar,
  List,
  ListItemText,
  Card,
  CircularProgress,
  CardHeader,
  CardContent,
  Tabs,
  Tab,
  Avatar,
  Grid,
  IconButton,
} from "@material-ui/core";
import { Folder, Check, Update } from "@material-ui/icons/";

import DatasetTabPanel from "./DataSetTabPanel";

export default function ViewAllDatasets() {
  const [allDatasets, setAllDatasets] = useState([]);
  const [selectedDatasetName, setSelectedDatasetName] = useState();
  const [selectedDataset, setSelectedDataset] = useState();
  const [value, setValue] = useState(0);
  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  const getDataset = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/dataset/`
    );
    setAllDatasets(res.data.datasets);
  };

  const fetchDataset = useCallback(async () => {
    if (selectedDatasetName !== undefined) {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/dataset/${selectedDatasetName}`
      );
      setSelectedDataset(res.data);
    }
  }, [selectedDatasetName]);

  useEffect(() => {
    getDataset();
  }, []);

  useEffect(() => {
    fetchDataset();
  }, [selectedDatasetName, fetchDataset]);

  return (
    <div>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5">
            All Datasets{" "}
            <IconButton
              style={{ marginLeft: "3rem" }}
              color="primary"
              onClick={getDataset}
            >
              <Update fontSize="inherit" />
            </IconButton>
          </Typography>
          <div>
            <List>
              {allDatasets.map((dataset) => (
                <ListItem
                  key={dataset.id}
                  button
                  onClick={() => setSelectedDatasetName(dataset.name)}
                  selected={
                    selectedDataset
                      ? dataset.name === selectedDataset.name
                      : false
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <Folder />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={dataset.name} secondary={dataset.id} />
                  <ListItemSecondaryAction>
                    {dataset.status === "completed" ? (
                      <Check color="primary" />
                    ) : (
                      <CircularProgress />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </div>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h5">Selected Dataset</Typography>
          {selectedDataset ? (
            <Card style={{ marginTop: "1.5rem" }}>
              <CardHeader
                title={selectedDataset.name}
                subheader={selectedDataset.id}
              />
              <CardContent>
                <Typography variant="body1">
                  Image/Class : {selectedDataset.num_images}
                </Typography>
              </CardContent>
              <CardContent>
                <Tabs
                  value={value}
                  onChange={handleChange}
                  textColor="primary"
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="simple tabs example"
                >
                  {selectedDataset.classes.map((c) => (
                    <Tab
                      key={c}
                      label={`${c} (${
                        selectedDataset.status === "completed"
                          ? selectedDataset.images[c].length
                          : 0
                      })`}
                    />
                  ))}
                </Tabs>
                {selectedDataset.classes.map((c, i) => (
                  <DatasetTabPanel
                    key={c}
                    images={
                      selectedDataset.images ? selectedDataset.images[c] : []
                    }
                    img_class={selectedDataset.classes[i]}
                    index={i}
                    value={value}
                    datasetName={selectedDataset.name}
                    status={selectedDataset.status}
                  />
                ))}
              </CardContent>
            </Card>
          ) : (
            <div style={{ textAlign: "center", marginTop: "3rem" }} size="500">
              <CircularProgress size={100} />
              <br />
              <br />
              <Typography variant="h6">Select a Dataset</Typography>
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
