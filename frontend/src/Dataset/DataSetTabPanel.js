import React from "react";
import { Box, Grid, Typography, CircularProgress } from "@material-ui/core";

export default function DataSetTabPanel(props) {
  const { value, index, images, datasetName, status, img_class } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
    >
      {value === index && status === "completed" ? (
        <Box p={3}>
          <Grid container spacing={2}>
            {images.map((filename, index) => (
              <Grid key={index} item xs={6} md={3}>
                <img
                  alt=""
                  width="100%"
                  height="200px"
                  src={`${process.env.REACT_APP_BACKEND_URL}/static/datasets/${datasetName}/${img_class}/${filename}`}
                />
                <Typography noWrap>Name : {filename}</Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <div style={{ textAlign: "center", marginTop: "3rem" }} size="500">
          <CircularProgress size={100} />
          <br />
          <br />
          <Typography variant="h6">
            {"🤖"} Robots are hard at work {"🤖"}
          </Typography>
        </div>
      )}
    </div>
  );
}
