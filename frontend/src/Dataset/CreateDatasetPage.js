import React, { useState } from "react";
import {
  Card,
  Typography,
  CardContent,
  Chip,
  TextField,
  Container,
  Button,
  CircularProgress,
  Snackbar,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import Alert from "@material-ui/lab/Alert";
import axios from "axios";
import { useHistory } from "react-router-dom";

export default function CreateDatsetPage() {
  const [classes, setClasses] = useState([]);
  const [classInput, setClassInput] = useState("");
  const [name, setName] = useState();
  const [imageCount, setImageCount] = useState();
  const [requesting, setRequesting] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState();
  const history = useHistory();
  const addClass = () => {
    setClasses([...classes, classInput.trim()]);
    setClassInput("");
  };

  const handleDelete = (name) => {
    setClasses(classes.filter((c) => c !== name));
  };

  const handleSubmit = async () => {
    if (!name) {
      setError("Dataset must have name");
      setOpenSnackbar(true);
      return;
    }
    if (imageCount < 20) {
      setError("Minimum 20 images");
      setOpenSnackbar(true);
      return;
    }
    if (classes.length < 2) {
      setError("Add atleast 2 classes");
      setOpenSnackbar(true);
      return;
    }
    setRequesting(true);
    const res = await axios
      .post(`${process.env.REACT_APP_BACKEND_URL}/dataset/create`, {
        name: name,
        classes: classes,
        num_images: imageCount,
      })
      .catch((e) => {
        setError("Error at backend");
        setOpenSnackbar(true);
      });
    setRequesting(false);
    if (res && res.status === 200) {
      history.push("/dataset");
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
              Create New Dataset
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Simple way to create datasets
            </Typography>
          </CardContent>
          <CardContent>
            <TextField
              disabled={requesting}
              fullWidth
              label="Dataset Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              disabled={requesting}
              fullWidth
              label="Images/class"
              type="number"
              style={{ marginTop: "1rem" }}
              variant="outlined"
              value={imageCount}
              onChange={(e) => setImageCount(e.target.value)}
            />
            <TextField
              disabled={requesting}
              fullWidth
              style={{ marginTop: "1rem" }}
              id="outlined-helperText"
              label="Classes"
              defaultValue="Cat"
              helperText="Press enter to add classes"
              variant="outlined"
              value={classInput}
              onChange={(e) => setClassInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addClass();
                }
              }}
            />
            <div style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
              {classes.map((c) => (
                <Chip
                  style={{ marginRight: "0.4rem" }}
                  key={c}
                  label={c}
                  onDelete={() => handleDelete(c)}
                  color="primary"
                />
              ))}
            </div>
            <Button
              disabled={requesting}
              variant="contained"
              color="primary"
              fullWidth
              className={classes.button}
              endIcon={requesting ? null : <Send />}
              onClick={handleSubmit}
            >
              {requesting ? <CircularProgress /> : "Create"}
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
