// Vendor Modules
import $ from 'jquery';
import _ from 'underscore';

// CSS
import './css/foundation.css';
import './css/style.css';

import Trip from './app/models/trip';
import TripList from './app/collections/trip_list';
import Reservation from './app/models/reservation';

// console.log('it loaded!');

const TRIP_FIELDS = ['name', 'continent', 'about', 'category', 'weeks', 'cost']

const RESERVE_FIELDS = ['name', 'age', 'email', 'tripId'];


//////////////////////////////////////////////////////////////
//////////////////////// ALL TRIPS ///////////////////////////
//////////////////////////////////////////////////////////////

// Create a new collection of all trips
const tripList = new TripList();

// Create a template for all trips to append to the page
const listTemplate = _.template($('#trip-template').html());

// Render all trips
const renderList = function renderList() {
  $('#trip-list').html('');
  tripList.forEach((trip) => {
    let generatedHtml = listTemplate(trip.attributes);
    $('#trip-list').append(generatedHtml);
    $(`#trip${ trip.id }`).click(function() {
      getTrip(trip.id);
      // let singleTrip = tripList.findWhere({id: tripID});
    });
  });
};

// Render on sort


////////////////////////////////////////////////////////////////
//////////////////////// SINGLE TRIP ///////////////////////////
////////////////////////////////////////////////////////////////

const singleTripTemplate = _.template($('#trip-info-template').html());

// Get one Trip
const getTrip = function getTrip(tripID) {
  $('#create-trip-form').hide();
  $('#trip-info').html('');
  let singleTrip = tripList.findWhere({id: tripID});
  singleTrip.fetch({
    success: (model, response) => {
      console.log('Model: ' + singleTrip.parse(model));
      console.log('Response: ' + response);
      showTrip(model);
    },
  });
};

// Render One Trip
const showTrip = function showTrip(trip) {
  let generatedHtml = singleTripTemplate(trip.attributes);
  $('#trip-info').html('');
  $('#trip-info').append(generatedHtml);
  $('#reserve-form').on('submit', (event) => {
    event.preventDefault();
    reserveTripHandler();
  });

  // console.log('THE CALL BACK FUNCTION WORKS!!');
};

//////////////////////////////////////////////////////////////
//////////////////////// CREATE TRIP /////////////////////////
//////////////////////////////////////////////////////////////

const newTripHandler = () => {
  let tripData = {};
  TRIP_FIELDS.forEach((field) => {
    const inputElement = $(`#new-trip-form input[name="${ field }"]`);
    const value = inputElement.val();
    tripData[field] = value;
  });

  let newTrip = new Trip(tripData);

  if (!newTrip.isValid()) {
    displayErrors(newTrip.validationError);
    return;
  }

  newTrip.save({}, {
    success: (model, response) => {
      tripList.add(model);
    },
    error: (model, response) => {
      console.log(response);
    },
  });
};

/////////////////////////////////////////////////////////////////
//////////////////////// RESERVE TRIP ///////////////////////////
/////////////////////////////////////////////////////////////////

const reserveTripHandler = () => {
  let reservation = {};
  RESERVE_FIELDS.forEach((field) => {
    const inputElement = $(`#reserve-form [name="${ field }"]`);
    const value = inputElement.val();

    reservation[field] = value;

    // Clears the form
    inputElement.val('');
  });

  let newReservation = new Reservation(reservation);
  // If it is valid it will return false
  if (!newReservation.isValid()) {

    // Returns the last value of the last failed validation - errors hash
    displayErrors(newReservation.validationError);
    return;
  }

  // Save as a post method to the API
  newReservation.save({}, {
    success: (model, response) => {
      // TODO: A popup to show that the resevation has been saved
      console.log('Your reservation has been saved!');
      // $('#reserve-form').reset();
    },
    error: (model, response) => {
      console.log(response);
    },
  });
};

/////////////////////////////////////////////////////////////////
//////////////////////// DISPLAY ERRORS /////////////////////////
/////////////////////////////////////////////////////////////////

const errorTemplate = _.template($('#error-template').html());

// Now I need to display the template and then append it to the place that i want to append it to
const displayErrors = (errors) => {
  $('#display-errors').empty();

  let errorObject = {};
  for (let key in errors) {
    errorObject[key] = errors[key];
  }

  let generatedHtml = errorTemplate(errorObject);
  $('#display-errors').append(generatedHtml);
};

/////////////////////////////////////////////////////////////////
////////////////////////////// SORT /////////////////////////////
/////////////////////////////////////////////////////////////////

const SORT_FIELDS = ['id', 'name', 'continent', 'about', 'category', 'weeks', 'cost']

// Attach sorting click handlers
const sortingHandler = () => {
  SORT_FIELDS.forEach((field) => {
    const headerElement = $(`.sort.${ field }`);
    console.log(field);
    // Attaching an event handler here for the .on function for each of the header elements
    headerElement.on('click', (event) => {
      // Comparator is a property
      tripList.comparator = field;
      // If you don't change the comparator it will resort based on the sort not the comparator
      tripList.sort();
      console.log('HITS SORT FUNCTION');
    });
  });
};

/////////////////////////////////////////////////////////////////
//////////////////////////// FILTER /////////////////////////////
/////////////////////////////////////////////////////////////////



$(document).ready(() => {
  $('#create-trip-form').hide();

  tripList.fetch();

  // Listen and register. Once an update has been heard, render all the collection into the template
  tripList.on('update', renderList);

  // Render form when the button is clicked
  $('#create-trip').on('click', (event) => {
    $('#trip-info').html('');
    $('#create-trip-form').show();
  });

  // On click new trip form
  $('#new-trip-form').on('submit', (event) => {
    event.preventDefault();
    newTripHandler();
  });

  sortingHandler();

  // On sort of the TripList
  tripList.on('sort', renderList);

  // const myFunction = () => {
  //   console.log('this function runs');
  // }

//   var activities = document.getElementById("activitySelector");
//
// activities.addEventListener("click", function() {
//     var options = activities.querySelectorAll("option");
//     var count = options.length;
//     if(typeof(count) === "undefined" || count < 2)
//     {
//         addActivityItem();
//     }
// });

  const filter = $('#filter').value;
  // TODO: I am right here
  filter.click(function() {
    let options = filter.querySelectorAll('option');
    let count = options.length;
    console.log('Options:' + options);
    console.log('Count: '+ count);
  });



  $('#search-bar').keyup(() => {
      var input, filter, table, tr, td, i;
      input = document.getElementById("search-bar");
      filter = input.value.toUpperCase();
      table = document.getElementById("all-trips");
      tr = table.getElementsByTagName("tr");
      for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
          if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        }
      };
  });

  // It works for ID but it does not work for Name


});


// SAVE THEN ADD TO THE LOCAL COLLECTION
