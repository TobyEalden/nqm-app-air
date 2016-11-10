/*
https://github.com/Leaflet/Leaflet.markercluster
https://github.com/troutowicz/geoshare/blob/7f0c45d433a0d52d78e02da9a12b0d2156fcbedc/test/app/components/MarkerCluster.jsx
http://leaflet.github.io/Leaflet.markercluster/example/marker-clustering-realworld.388.html
https://github.com/Leaflet/Leaflet.markercluster#usage
*/

import React from "react";
import ReactDOM from 'react-dom';
import Paper from 'material-ui/Paper';
import Control from 'react-leaflet-control';
import { Map, TileLayer, Marker, Popup, LayerGroup, ZoomControl } from 'react-leaflet';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import DatePicker from 'material-ui/DatePicker';
import MarkerCluster from "./markercluster"
import Chart from "./chart";

const defaultData = [{ lat: 52.008778, lon: -0.771088}];
const molecules = {1:'All', 2:'NO2', 3:'SO2', 4:'PM10', 5:'PM25', 6:'O3'};

class Livemap extends React.Component {
    constructor(props) {
        super(props);

        let date = new Date();
    
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        this.state = {
            centerPosition: L.latLng(defaultData[0], defaultData[1]),
            moleculeIndex: 1,
            mapType: 1,
            filterDate: date,
        };
    }

    componentWillMount() {
        let bounds = L.latLngBounds(_.map(this.props.metaData, (val, key)=>{
            return L.latLng(val.Latitude, val.Longitude);
        }));

        this.setState({
            centerPosition: bounds.getCenter()
        });
    }

    componentWillReceiveProps(nextProps) {
        console.log(nextProps.data);
    }
    
    handleMoleculeChange(event, index, value){
        this.setState({
            moleculeIndex: value
        })
    }

    handleMapType(event, index, value){
        this.setState({
            mapType: value
        })
    }

    handleDateChange(event, date) {
        this.setState({
            filterDate: date,
        });        
    }

    _onClickMarker(id) {
        const gte = this.state.filterDate.getTime();
        const lte = gte + 24*60*60*1000;

        if (this.state.moleculeIndex!=1)
            this.props.onUpdatePlot(id, [gte, lte]);
    }

    render() {
        let self = this;
        let markerComponent = null;

        const style = {
            height: 100,
            width: 100,
            margin: 20,
            textAlign: 'center',
            display: 'inline-block',
        };

        if (!_.isEmpty(self.props.metaData)) {
            
            markerComponent =
                <MarkerCluster
                    moleculeType={molecules[this.state.moleculeIndex]}
                    metaData={self.props.metaData}
                    realTimeData={self.props.realTimeData}
                    onClickMarker={this._onClickMarker.bind(this)}
                />
        }

        return (
            <Map
                center={this.state.centerPosition}
                zoom={11}
                scrollWheelZoom={false}
                touchZoom={false}
                maxBounds={null}
                dragging={true}
                zoomControl={false}
            >
                <TileLayer
                    url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {markerComponent}
                <ZoomControl position='bottomright' />
                <Control position="topright" >
                    <div className="chartinfo">
                        <div className="flex-container-column">
                            <div className="lex-items-column">
                                <Chart data={[]} type={"Line"} barcount={3}/>
                            </div>
                            <div className="lex-items-column">
                                <Chart data={[]} type={"Bar"} barcount={3}/>
                            </div>
                            <div className="lex-items-column">
                                <MuiThemeProvider muiTheme={this.context.muiTheme}>
                                    <DatePicker
                                        floatingLabelText="Filter Date"
                                        hintText="Filter date"
                                        value={this.state.filterDate}
                                        onChange={this.handleDateChange.bind(this)}
                                    />
                                </MuiThemeProvider>
                            </div>
                        </div>
                    </div>
                </Control>
                <Control position="topleft" >
                    <MuiThemeProvider muiTheme={this.context.muiTheme}>
                        <div className="chartinfo">
                            <DropDownMenu value={this.state.moleculeIndex} onChange={this.handleMoleculeChange.bind(this)}>
                                <MenuItem value={1} primaryText={molecules[1]} />
                                <MenuItem value={2} primaryText={molecules[2]} />
                                <MenuItem value={3} primaryText={molecules[3]} />
                                <MenuItem value={4} primaryText={molecules[4]} />
                                <MenuItem value={5} primaryText={molecules[5]} />
                                <MenuItem value={6} primaryText={molecules[6]} />
                            </DropDownMenu>
                            <DropDownMenu value={this.state.mapType} onChange={this.handleMapType.bind(this)}>
                                <MenuItem value={1} primaryText="Sensor Map" />
                                <MenuItem value={2} primaryText="Heat Map" />
                            </DropDownMenu>
                        </div>
                    </MuiThemeProvider>
                </Control>
            </Map>);
    }
}

Livemap.propTypes = {
    metaData: React.PropTypes.object.isRequired,
    realTimeData: React.PropTypes.array.isRequired,
    onUpdatePlot: React.PropTypes.func.isRequired,
    data: React.PropTypes.array.isRequired
};

Livemap.contextTypes = {
  muiTheme: React.PropTypes.object
};

export default Livemap;
