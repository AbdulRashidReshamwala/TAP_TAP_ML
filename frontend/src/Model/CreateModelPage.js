import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Container,
  Button,
  CircularProgress,
  Snackbar,
  Slider,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import Alert from "@material-ui/lab/Alert";
import axios from "axios";
import { useHistory } from "react-router-dom";

export default function CreateModelPage() {
  const [allDatasets, setAllDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [selectedArch, setSelectedArch] = useState("");
  const [imageSize, setImageSize] = useState("");
  const [epochs, setEpochs] = useState(2);
  const [error, setError] = useState();
  const history = useHistory();

  const getDataset = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/dataset/`
    );
    setAllDatasets(res.data.datasets.filter((d) => d.status == "completed"));
  };

  useEffect(() => {
    getDataset();
  }, []);

  const handleSubmit = async () => {
    if (selectedDataset === "" || selectedDataset === "" || imageSize === "") {
      setError("All feilds are required");
      setOpenSnackbar(true);
      return;
    }
    setRequesting(true);
    const res = await axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/model/create`, {
        arch: selectedArch,
        dataset_name: selectedDataset,
        epochs: epochs,
        img_size: imageSize,
      })
      .catch((e) => {
        setError("Error at backend");
        setOpenSnackbar(true);
      });
    setRequesting(false);
    if (res && res.status === 200) {
      history.push("/model");
    } else {
      setError("Error at backend");
      setOpenSnackbar(true);
    }
  };

  const handleClose = () => {
    setOpenSnackbar(false);
  };

  return (
    <div>
      <Container>
        <Card>
          <CardContent>
            <Typography variant="h3" color="primary">
              Create New Model
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Train model on created datasets
            </Typography>
          </CardContent>
          <CardContent>
            <div style={{ margin: "1rem" }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Dataset</InputLabel>
                <Select
                  required
                  label="Dataset"
                  value={selectedDataset}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {allDatasets.map((d) => (
                    <MenuItem value={d.name} key={d.name}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div style={{ margin: "1rem" }}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Architecture</InputLabel>
                <Select
                  required
                  label="Architecture"
                  value={selectedArch}
                  onChange={(e) => setSelectedArch(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={"squeezenet"}>squeezenet</MenuItem>
                  <MenuItem value={"vgg_16"}>VGG16</MenuItem>
                  <MenuItem value={"vgg_19"}>VGG19</MenuItem>
                  <MenuItem value={"resnet_18"}>Resnet 18</MenuItem>
                  <MenuItem value={"resnet_34"}>Resnet 34</MenuItem>
                  <MenuItem value={"resnet_101"}>Resnet 101</MenuItem>
                  <MenuItem value={"resnet_152"}>Resnet 152</MenuItem>
                  <MenuItem value={"densenet_121"}>DenseNet 121</MenuItem>
                  <MenuItem value={"densenet_169"}>DenseNet 169</MenuItem>
                  <MenuItem value={"vgg_16"}>VGG16</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div style={{ margin: "1rem" }}>
              <FormControl variant="outlined" fullWidth>
                <InputLabel>Image Size</InputLabel>
                <Select
                  required
                  label="Image Size"
                  value={imageSize}
                  onChange={(e) => setImageSize(e.target.value)}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={224}>224x224</MenuItem>
                  <MenuItem value={320}>320x320</MenuItem>
                  <MenuItem value={420}>420x420</MenuItem>
                  <MenuItem value={512}>512x512</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div style={{ margin: "1rem" }}>
              <Typography id="discrete-slider-small-steps" gutterBottom>
                Epochs
              </Typography>
              <Slider
                defaultValue={5}
                step={1}
                value={epochs}
                marks
                min={2}
                max={25}
                valueLabelDisplay="auto"
                onChange={(e, v) => setEpochs(v)}
              />
            </div>

            <Button
              disabled={requesting}
              variant="contained"
              color="primary"
              fullWidth
              endIcon={requesting ? null : <Send />}
              onClick={handleSubmit}
            >
              {requesting ? <CircularProgress /> : "Train"}
            </Button>
          </CardContent>
        </Card>
      </Container>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}
