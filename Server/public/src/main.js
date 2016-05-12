var RecordBox = React.createClass ({
  loadingDataFromServer: function () {
  	$.ajax ({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function (data) {
      	this.setState ({data: data});
      }.bind (this),
      error: function (xhr, status, err) {
        console.error (this.props.url, status, err.toString ());
      }.bind (this)
  	}); 
  },
  getInitialState: function () {
  	return {data: []};
  },
  componentDidMount: function () {
  	this.loadingDataFromServer ();
  	setInterval (this.loadingDataFromServer, this.props.pollInterval);
  },
  render: function () {
  	return (
      <div className="recordBox">
        <h1>Hospital</h1>
        <PlaceList data={this.state.data}/>
      </div>
  	);
  }	
});

var PlaceList = React.createClass ({
  render: function () {
  	var placeNodes = this.props.data.map (function (data) {
      return (
        <Place place={data}>
        </Place>
      );
  	});
  	return (
      <div className="placeList">
        {placeNodes}
      </div>
  	);
  }	
});

var Place = React.createClass ({
  render: function () {
    return (
      <div className="place">
        <h2>Place: {this.props.place.inPlace}</h2>
        <BioWatchList devices={this.props.place.devices}/>
      </div>
    );
  }
});

var BioWatchList = React.createClass ({
  render: function () {
  	var bioWatchNodes = this.props.devices.map (function (device) {
  	  return (
  	  	<BioWatch bioSignal={device}>
  	  	</BioWatch>
  	  );
  	});

  	return (
      <div className='bioWatchList'>
        {bioWatchNodes}
      </div>
    );
  }
});

var BioWatch = React.createClass ({
  render: function () {
  	return (
  	  <div className='bioWatch'>
  	    <h3>BioWatch id: {this.props.bioSignal.device_id} pulse: {this.props.bioSignal.pulse}</h3>
  	  </div>
  	);
  }
});

ReactDOM.render (
  <RecordBox url='/api/patients_status' pollInterval={2000} />,
  document.getElementById ('content')
);