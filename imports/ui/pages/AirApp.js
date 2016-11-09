"use strict";

import React from "react";
import ReactDOM from 'react-dom';
import {Meteor} from "meteor/meteor";
import { blue900, blue100 } from 'material-ui/styles/colors';
import Snackbar from 'material-ui/Snackbar';
import 'leaflet';
import 'leaflet.markercluster';
import * as _ from "lodash";
import TDXAPI from "nqm-api-tdx/client-api";

import Livemap from "../components/livemap"
import ChartContainer from "./chart-container"
import connectionManager from "../../api/manager/connection-manager";

class AirApp extends React.Component {
  constructor(props) {
    super(props);

    this.tdxApi = new TDXAPI({
      commandHost: Meteor.settings.public.commandHost,
      queryHost: Meteor.settings.public.queryHost,
      accessToken: connectionManager.authToken
    });

    this.state = {
      snackBarMessage:"",
      snackBarOpen: false,
      airMetadata: {},
      chartType: "Line"
    };
  }

  _onClickMarker(id) {
  
  }

  handleSnackbarClose() {
    this.setState({
      snackBarOpen: false
    });
  };

  componentWillMount() {
    let airMetadata = {};

    this.tdxApi.getDatasetData(Meteor.settings.public.airMetadata, null, null, null, (err, data)=>{
      if (err) {
        this.setState({
          snackBarOpen: true,
          snackBarMessage: "No air metadata available!"
        });  
      } else {
        if (!data.data.length){
          this.setState({
            snackBarOpen: true,
            snackBarMessage: "No air metadata available!"
          });          
        } else {

          _.forEach(data.data, (val)=>{
            airMetadata[val.SiteCode] = val;
          });

          this.setState({
            'airMetadata': airMetadata
          });
        }
      }
    });
  }

  componentDidMount() {
  }

  render() {
    let cPos = L.latLng(52.008778, -0.771088);

    const appBarHeight = Meteor.settings.public.showAppBar !== false ? 50 : 0;
    const styles = {
      root: {
        height: "100%"
      },
      mainPanel: {
        position: "absolute",        
        top: appBarHeight,
        bottom: 0,
        left: 0,
        right: 0
      }
    };
    let liveMap = null;

    if (!_.isEmpty(this.state.airMetadata)) {
      liveMap =
        (<Livemap
          metaData={this.state.airMetadata}
          realTimeData={this.props.data}
          onClickMarker={this._onClickMarker.bind(this)}
          centerPosition={cPos}
        />);  
    }

    return (
      <div style={styles.mainPanel}>
        {liveMap}
        <Snackbar
          open={this.state.snackBarOpen}
          message={this.state.snackBarMessage}
          autoHideDuration={4000}
          onRequestClose={this.handleSnackbarClose.bind(this)}
        />
      </div>
    );
  }
}

AirApp.propTypes = {
  data: React.PropTypes.array.isRequired,
};

export default AirApp;
