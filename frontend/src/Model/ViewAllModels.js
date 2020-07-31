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
  Avatar,
  Grid,
  IconButton,
  Button,
  Paper,
} from "@material-ui/core";
import { Settings, Check, HourglassFull, Update } from "@material-ui/icons/";
import { EventTracker, HoverState } from "@devexpress/dx-react-chart";
import {
  Chart,
  SplineSeries,
  ArgumentAxis,
  ValueAxis,
  Legend,
  Tooltip,
  ZoomAndPan,
} from "@devexpress/dx-react-chart-material-ui";

const rootStyles = {
  display: "flex",
  margin: "auto",
  flexDirection: "row",
};
const LegendRoot = (props) => <Legend.Root {...props} style={rootStyles} />;

const defaultLabelStyles = {
  marginBottom: "8px",
  whiteSpace: "nowrap",
  fontSize: "20px",
};
const hoveredLabelStyles = {
  ...defaultLabelStyles,
  color: "black",
};
const LegendLabel = ({ hoveredSeriesName, text }) => (
  <div
    style={hoveredSeriesName === text ? hoveredLabelStyles : defaultLabelStyles}
  >
    {text}
  </div>
);

const itemStyles = {
  flexDirection: "column-reverse",
};
const LegendItem = (props) => <Legend.Item {...props} style={itemStyles} />;

export default function ViewAllModels() {
  const [imgSrc, setImgSrc] = useState();
  const [allModels, setAllModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState();
  const [selectedModelName, setSelectedModelName] = useState();
  const [hover, setHover] = useState();
  const [chartData1, setChartData1] = useState();
  const [chartData2, setChartData2] = useState();
  const [hover2, setHover2] = useState();
  const [resultData, setResultData] = useState();

  const getModels = async () => {
    const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/model/`);
    setAllModels(res.data.models);
  };

  useEffect(() => {
    getModels();
  }, []);

  const fetchModel = useCallback(async () => {
    if (selectedModelName !== undefined) {
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/model/${selectedModelName}`
      );
      setSelectedModel(res.data);
      if (res.data.status === "completed") {
        const meta = res.data.meta;
        let cD1 = meta.metrics.map((a, i) => ({
          acc: a[1],
          epoch: i + 1,
          err_rate: a[0],
        }));
        let cD2 = meta.loss.map((a, i) => ({
          loss: a,
          step: i + 1,
          lr: meta.lr[i],
        }));
        setChartData1(cD1);
        setChartData2(cD2);
      } else {
        setChartData1();
        setChartData2();
      }
    }
  }, [selectedModelName]);

  useEffect(() => {
    fetchModel();
  }, [selectedModelName, fetchModel]);

  useEffect(() => {
    const d = async () => {
      let fd = new FormData();
      fd.append("file", imgSrc);
      let res = await axios({
        url: `${process.env.REACT_APP_BACKEND_URL}/model/predict/${selectedModelName}`,
        method: "post",
        data: fd,
        headers: {
          "content-type": `multipart/form-data; boundary=${fd._boundary}`,
        },
      });
      let r = res.data.classes.map((c, i) => ({
        c: c,
        p: res.data.prob[i] * 100,
      }));
      setResultData(r);
    };
    if (selectedModelName !== undefined) {
      d();
    }
  }, [imgSrc, selectedModelName]);
  return (
    <div>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Typography variant="h5">
            All available Models{" "}
            <IconButton
              style={{ marginLeft: "3rem" }}
              color="primary"
              onClick={getModels}
            >
              <Update fontSize="inherit" />
            </IconButton>
          </Typography>

          <div>
            <List>
              {allModels.map((model) => (
                <ListItem
                  key={model.id}
                  button
                  onClick={() => setSelectedModelName(model.name)}
                  selected={
                    selectedModelName ? model.name === selectedModelName : false
                  }
                >
                  <ListItemAvatar>
                    <Avatar>
                      <Settings />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={model.name} secondary={model.id} />
                  <ListItemSecondaryAction>
                    {model.status === "completed" ? (
                      <Check color="primary" />
                    ) : model.status === "working" ? (
                      <CircularProgress />
                    ) : (
                      <HourglassFull />
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </div>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h5">Selected Model</Typography>
          {selectedModel ? (
            <Card style={{ marginTop: "1.5rem" }}>
              <Grid container>
                <Grid item xs={6}>
                  <CardHeader
                    title={selectedModel.name}
                    subheader={selectedModel.id}
                  />
                  <CardContent>
                    <Typography variant="body1">
                      Architecture : {selectedModel.arch}
                    </Typography>
                    <Typography variant="body1">
                      Dataset : {selectedModel.dataset_name}
                    </Typography>
                    <Typography variant="body1">
                      Image Size : {selectedModel.img_size}
                    </Typography>
                    <Typography variant="body1">
                      Epochs : {selectedModel.epochs}
                    </Typography>
                  </CardContent>
                </Grid>
              </Grid>
              <CardContent>
                <Typography variant="h4" gutterBottom>
                  Metrics
                </Typography>
                {chartData1 && chartData2 ? (
                  <div>
                    <Paper
                      elevation={3}
                      variant="outlined"
                      style={{ margin: "2rem", padding: "2rem" }}
                    >
                      <Chart data={chartData1}>
                        <ArgumentAxis />
                        <ValueAxis />

                        <SplineSeries
                          name="Accurcy"
                          valueField="acc"
                          argumentField="epoch"
                        />

                        <SplineSeries
                          name="Error Rate"
                          valueField="err_rate"
                          argumentField="epoch"
                        />
                        <Legend
                          position="bottom"
                          rootComponent={LegendRoot}
                          itemComponent={LegendItem}
                          labelComponent={LegendLabel}
                        />
                        <EventTracker />
                        <ZoomAndPan />
                        <Tooltip />
                        <HoverState hover={hover} onHoverChange={setHover} />
                      </Chart>
                      <br />
                    </Paper>
                    <Grid container>
                      <Grid item xs={6}>
                        <Paper
                          elevation={3}
                          variant="outlined"
                          style={{ margin: "2rem", padding: "2rem" }}
                        >
                          <Chart data={chartData2}>
                            <ArgumentAxis />
                            <ValueAxis />

                            <SplineSeries
                              name="Loss"
                              valueField="loss"
                              argumentField="step"
                            />

                            <Legend
                              position="bottom"
                              rootComponent={LegendRoot}
                              itemComponent={LegendItem}
                              labelComponent={LegendLabel}
                            />
                            <EventTracker />
                            <ZoomAndPan />
                            <Tooltip />
                            <HoverState
                              hover={hover2}
                              onHoverChange={setHover2}
                            />
                          </Chart>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper
                          elevation={3}
                          variant="outlined"
                          style={{ margin: "2rem", padding: "2rem" }}
                        >
                          <Chart data={chartData2}>
                            <ArgumentAxis />
                            <ValueAxis />

                            <SplineSeries
                              name="Learning Rate"
                              valueField="lr"
                              argumentField="step"
                            />
                            <Legend
                              position="bottom"
                              rootComponent={LegendRoot}
                              itemComponent={LegendItem}
                              labelComponent={LegendLabel}
                            />
                            <EventTracker />
                            <ZoomAndPan />
                            <Tooltip />
                            <HoverState
                              hover={hover2}
                              onHoverChange={setHover2}
                            />
                          </Chart>
                        </Paper>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={6}>
                        <Typography variant="h4" gutterBottom>
                          Test model
                        </Typography>
                        <input
                          accept="image/*"
                          id="contained-button-file"
                          multiple
                          type="file"
                          onChange={(e) => setImgSrc(e.target.files[0])}
                          style={{ display: "none" }}
                        />
                        <div style={{ margin: "2rem" }}>
                          <label htmlFor="contained-button-file">
                            <Button
                              variant="contained"
                              color="primary"
                              component="span"
                            >
                              Upload Image
                            </Button>
                          </label>
                        </div>
                        {imgSrc ? (
                          <img
                            src={URL.createObjectURL(imgSrc)}
                            height="200"
                            width="auto"
                          />
                        ) : null}
                      </Grid>
                      <Grid item xs={6}>
                        <Paper>
                          {resultData
                            ? resultData.map((r) => (
                                <div style={{ padding: "1 rem" }}>
                                  <Typography color="primary">
                                    {r.c}
                                    {" : "}
                                    <span style={{ color: "black" }}>
                                      {r.p}
                                      {" %"}
                                    </span>
                                  </Typography>
                                </div>
                              ))
                            : null}
                        </Paper>
                      </Grid>
                    </Grid>
                  </div>
                ) : (
                  <div
                    style={{ textAlign: "center", marginTop: "3rem" }}
                    size="500"
                  >
                    <CircularProgress size={100} />
                    <br />
                    <br />
                    <Typography variant="h6">
                      {"🤖"} Robots are hard at work {"🤖"}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {" "}
                      Model in training
                    </Typography>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div style={{ textAlign: "center", marginTop: "3rem" }} size="500">
              <CircularProgress size={100} />
              <br />
              <br />
              <Typography variant="h6">Select a Model</Typography>
            </div>
          )}
        </Grid>
      </Grid>
    </div>
  );
}
