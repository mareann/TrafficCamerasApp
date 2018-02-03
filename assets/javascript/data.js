
 /* 
 required
 <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
  <script src="https://cdn.jsdelivr.net/momentjs/2.12.0/moment.min.js"></script>
  <script src="https://www.gstatic.com/firebasejs/4.9.0/firebase.js"></script>
 
  CHICAGO coordinates
  Latitude‎: ‎41.881832
  Longitude‎: ‎-87.623177 

  database notes:

      locations
        approach1:    approach1 is 1st camera direction (string)
        approach2:    approach2 is 2nd camera direction (string)
        approach3:    approach3 is 3rd camera direction (string)
        cameraType:   1=redLight 2=speed (number)
        goLiveDate:   goLiveDate date camera went live (date MM/DD/YYYY)
        intersection: intersecting streets (string)
        latitude:     location (float)
        longitude:    location (float)
        number:       incrementing number

      lastUpdate    
        Date:         date of update (must be a string MM/DD/YYYY hh:mm) 
                                     (firebase wants string date or its own timestamp)
      Sample data for speed camera
      locations
       approach1: "SB"
       approach2: "null"
       approach3: ""
       cameraType: 2
       goLiveDate: "01/04/2014"
       intersection: "4436 N Western (Speed Camera)"
       latitude: 41.9624218495406
       longitude: -87.68886227502836
       number: 189
*/
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyDYK8ax3uqWP-K6DkOg9S-r8_NYYrzJoG8",
    authDomain: "cameras-1420a.firebaseapp.com",
    databaseURL: "https://cameras-1420a.firebaseio.com",
    projectId: "cameras-1420a",
    storageBucket: "cameras-1420a.appspot.com",
    messagingSenderId: "643375403696"
  };

 firebase.initializeApp(config);

  // ================================================================================

  // Get a reference to the database service
  var database = firebase.database();

  // ref to locations and lastUpdate
  const locations = database.ref().child("locations");
  const dateRef = database.ref().child("lastUpdate")

  // initial variables
  var redLightCount=0;
  var speedCount = 0;
  var updateTime;
  var timeBetweenUpdates = 1; // days
  var debug = 0;

  // query speed cameras 
  var queryURL_speed = "https://data.cityofchicago.org/api/views/4i42-qv3h/rows.json?accessType=DOWNLOAD"
  
  // query red light cameras
  var queryURL_redLight = "https://data.cityofchicago.org/api/views/thvf-6diy/rows.json?accessType=DOWNLOAD"

  // current time for database update
  var now = moment();
  var currentTime = moment(now).format("MM/DD/YY HH:mm");

  if ( debug )
  {
    var tmp = moment(currentTime).subtract(1,"days");
    tmp = moment(tmp).format("MM/DD/YY HH:mm")
    //console.log("tmp "+tmp)
    
    // add date timestamp of database update
    var tmpRef = dateRef.set ({ 
         //Date: currentTime 
         Date: tmp  // testing
     }); // end push date
  }
  ////////////////////////////////////////////////
  //
  // updateCamerasDatabase()
  //
  // update if database has not been updated
  // send timeBetweenUpdates variable
  // 
  ///////////////////////////////////////////////
  function updateCamerasDatabase() {
    
    // empty database
    database.ref().set("");

    //var tmp = currentTime.subtract(1,"days")
    // add date timestamp of database update
    var tmpRef = dateRef.set ({ 
         Date: currentTime    
        // Date: tmp  // testing
     }); // end push date

    var totalRed = redLightCameraData();
    var totalSpeed = speedCameraData();

    //does not keep values?????
    //console.log("updateCamerasDatabase redLightCount "+totalRed+" "+redLightCount);
  }
  ////////////////////////////////////////////////
  //
  //   Runs once to check the date
  //   in database and compare to
  //   current time
  //   If time to update call
  //   updateCamerasDatabase()
  //   Note: dateRef is the child("lastUpdate")
  //   tmpDate JSON format {,Date,:,01/27/18 18:50,}
  // 
  ///////////////////////////////////////////////

  dateRef.once('value')
  .then(function(snapshot) {
    console.log("hi")
    var datedb = snapshot.val(); 
    var tmpDate = JSON.stringify(datedb).split("\"");
    var updateTmp = tmpDate[3];

    updateTime = moment(updateTmp);
    var timeDiff = now.diff(updateTime,'days',true); // diff true returns fraction of days
    //console.log("timeDiff "+timeDiff);

    if ( timeDiff > timeBetweenUpdates )
    {
      //console.log("updating...timeDiff "+timeDiff+' days'+moment(timeDiff).format('h')+" hours");
      updateCamerasDatabase();
    }

  });

  ////////////////////////////////////////////////
  //
  // redLightCameraData()
  //
  // Insert Red Light Camera Data in database
  //
  // Sample JSON DATA
  // Red Light obj[0][5944
  // Red Light obj[1]"0B7DA671-A671-40C7-8F73-C9B0F5A392A1"
  // Red Light obj[2]5944
  // Red Light obj[3]1414553253
  // Red Light obj[4]"878752"
  // Red Light obj[5]1414553253
  // Red Light obj[6]"878752"
  // Red Light obj[7]null
  // Red Light obj[8]"Pulaski-Diversey"
  // Red Light obj[9]"SB"
  // Red Light obj[10]"NB"
  // Red Light obj[11]null
  // Red Light obj[12]"2009-05-15T00:00:00"
  // Red Light obj[13]"41.931791"
  // Red Light obj[14]"-87.726979"
  // Red Light obj[15]["{\"address\":\"\"
  // Red Light obj[16]\"city\":\"\"
  // Red Light obj[17]\"state\":\"\"
  // Red Light obj[18]\"zip\":\"\"}"
  // Red Light obj[19]"41.931791"
  // Red Light obj[20]"-87.726979"
  // Red Light obj[21]null
  // Red Light obj[22]false]]
  //
  ///////////////////////////////////////////////
  function redLightCameraData() {

    // locations transaction
    locations.transaction( function() {

    // Performing an AJAX request with the queryURL
    $.ajax({
        url: queryURL_redLight,
        method: "GET"
    })
    // After data comes back from the request
    .then(function(response) {

     // storing the data from the AJAX request in the results variable
     var results = response.data;

     //console.log("results length "+results.length+"results "+results[0]);
     
     var number = 1;
     var intersection = "";
     var approach1 = "";
     var approach2 = "";
     var approach3 = "";
     var goLiveDate = "";
     var latitude = "";
     var longitude = "";
     var redLight = 1;
     var speed = 2;

     var cameraObj = {
      cameraType: redLight,
      number: 1,
      intersection: intersection,
      approach1: approach1,
      approach2: approach2,
      approach3: approach3,
      goLiveDate: goLiveDate,
      latitude: latitude,
      longitude: longitude
     }

     // Looping through each result item
     for (var i=0; i < results.length;i++)
      {

        var obj = JSON.stringify(results[i]).split(",");
        //document.getElementById("demo").innerHTML = obj;
                
        //debug 
        if ( debug )
        {    
        if ( i == 0 )
          {
           for (var j = 0; j < obj.length; j++) 
            {
             //display one set of data
              console.log("Red Light obj["+j+"]"+obj[j]);
            }
          } // end if i
        }

        // for red light data
        cameraObj.number = i+1;
        var str = obj[8];
        var res = str.replace(/['"']+/g, '');
        cameraObj.intersection = res;
        str = obj[9];
        res = str.replace(/['"']+/g, '');
        cameraObj.approach1 = res;
        str = obj[10];
        res = str.replace(/['"']+/g, '');
        cameraObj.approach2 = res;
        str = obj[11];
        res = str.replace(/['"']+/g, '');
        cameraObj.approach3 = res;
        str = obj[12];
        res = str.replace(/['"']+/g, '');
        cameraObj.goLiveDate = res;
        str = obj[13];
        res = str.replace(/['"']+/g, '');
        cameraObj.latitude = parseFloat(res);
        str = obj[14];
        res = str.replace(/['"']+/g, '');
        cameraObj.longitude = parseFloat(res);
        cameraObj.cameraType = redLight;

        // Code for handling the push
        var newRef = locations.push(  { 
          cameraObj
        }); // end push cameraObj
      
        redLightCount = i+1;

      } //end for i
     }); // end ajax redLight
   }); //end transaction

  } // end redLightData

  ////////////////////////////////////////////////
  //
  // speedCameraData()
  //
  // Insert Speed Camera Data
  //
  // Sample JSON DATA
  // speed obj[0][4658
  // speed obj[1]"5CC304FE-0F80-448D-AFAC-24F3789F20B0"
  // speed obj[2]4658
  // speed obj[3]1427253157
  // speed obj[4]"878752"
  // speed obj[5]1427253157
  // speed obj[6]"878752"
  // speed obj[7]null
  // speed obj[8]"3843 W 111th (Speed Camera)"
  // speed obj[9]"EB"
  // speed obj[10]"WB"
  // speed obj[11]"01/13/2014"
  // speed obj[12]"41.69120239624487"
  // speed obj[13]"-87.71721139909997"
  // speed obj[14]["{\"address\":\"\"
  // speed obj[15]\"city\":\"\"
  // speed obj[16]\"state\":\"\"
  // speed obj[17]\"zip\":\"\"}"
  // speed obj[18]"41.69120239624487"
  // speed obj[19]"-87.71721139909997"
  // speed obj[20]null
  // speed obj[21]false]]
  //
  /////////////////////////////////////////////// 
  function speedCameraData() {

    // locations transaction
    locations.transaction(function() {

    // Performing an AJAX request with the queryURL
    $.ajax({
        url: queryURL_speed,
        method: "GET"
    })
    // After data comes back from the request
    .then(function(response2) {

      // storing the data from the AJAX request in the results variable
      var results = response2.data;
/*
console.log("queryURL "+queryURL_speed); 
console.log("results length "+results.length+" results "+results[0]);
*/
      var number = 1;
      var intersection = "";
      var approach1 = "";
      var approach2 = "";
      var approach3 = "";
      var goLiveDate = "";
      var latitude = "";
      var longitude = "";
      var redLight = 1;
      var speed = 2;

      var cameraObj = {
       cameraType: speed,
       number: 1,
       intersection: intersection,
       approach1: approach1,
       approach2: approach2,
       approach3: approach3,
       goLiveDate: goLiveDate,
       latitude: latitude,
       longitude: longitude
      }

      // Looping through each result
      for (var i=0; i < results.length;i++)
      {

        var obj = JSON.stringify(results[i]).split(",");
        
        if ( debug ) 
        {       
          if ( i == 0)
           {
            for (var j = 0; j < obj.length; j++) 
             {
               //display one set of data
               console.log("speed obj["+j+"]"+obj[j]);
             }
           } // end if i
        }

        // for speed camera
        var str = obj[8];
        var res = str.replace(/['"']+/g, '');
        cameraObj.intersection = res;
        str = obj[9];
        res = str.replace(/['"']+/g, '');
        cameraObj.approach1 = res;
        str = obj[10];
        res = str.replace(/['"']+/g, '');
        cameraObj.approach2 = res;
        cameraObj.approach3 = "";
        str = obj[11];
        res = str.replace(/['"']+/g, '');
        cameraObj.goLiveDate = res;
        str = obj[12];
        res = str.replace(/['"']+/g, '');
        cameraObj.latitude = parseFloat(res);
        str = obj[13];
        res = str.replace(/['"']+/g, '');
        cameraObj.longitude = parseFloat(res);
        cameraObj.cameraType = speed;
        cameraObj.number = i+redLightCount+1; //continue count from total redlight cameras

        // Code for handling the push
        var newRef = locations.push({
          cameraObj
        }); //end push cameraObj
        
        speedCount = i+1;

      } //end for i

     }); // end ajax speed
   });// end transactions

  } // end speed


