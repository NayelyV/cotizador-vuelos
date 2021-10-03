//////////////////////////////////////////////////////
/***************** Global Variables *****************/
/////////////////////////////////////////////////////

// Flight type
let flightValue = 1 //1 redondo, 2 sencillo
let roundFlight = $("#round")
let simpleFlight = $("#simple")

// Cities
const URLCITIES = "../data/cities.json"
let cities = []
let originCities = $("#origin-cities")
let destinyCities = $("#destiny-cities")
let origin= ""
let destiny = ""

// Dates
let returnDateContainer = $("#return-date-container")
let departureDate = $("#departure-date")
let returnDate = $("#return-date")
let departure = ""
let returnSelected = ""

// Search
let button = $("#submit-button")

// Airlines
const URLAIRLINES = "../data/airlines.json"
let airlines = []

// Quotes
let quotes = []

// Flights
let resultsContainer = $("#results-container") 
let flights = []
let flightsSelected = []

// Tickets
let ticketsContainer = $("#tickets") 
ticketsContainer.hide()

//////////////////////////////////////////////////////
/********************* Requests *********************/
/////////////////////////////////////////////////////

// Cities
$.getJSON(URLCITIES, function(respuesta, estado) {
    if (estado === "success") {
        cities = respuesta;
        showRecents()
    }
}) 

// Airlines
$.getJSON(URLAIRLINES, function(respuesta, estado) {
    if (estado === "success") {
        airlines = respuesta;
    }
}) 

//////////////////////////////////////////////////////
/******************* Flight type ********************/
/////////////////////////////////////////////////////

roundFlight.click(function() {
    returnDateContainer.toggle('fast').animate({opacity:'1'}, 'fast')
    flightValue = 1
})

simpleFlight.click(function(){
    returnDateContainer.css('fast', '0').toggle('fast')
    flightValue = 2
})

//////////////////////////////////////////////////////
/***************** Origin - Destiny *****************/
/////////////////////////////////////////////////////

// Show cities
cities.forEach((city) => {
    originCities.append(`<option value="${city.name}"></option>`)
    destinyCities.append(`<option value="${city.name}"></option>`)
})

// Verify origin - destiny
const verifyCities = () => {
    let originValue = $("#origin-choice").val()
    let destinyValue = $("#destiny-choice").val()
    if (originValue == null || originValue == "") {
        alert("Es necesario que ingreses un origen")
    } else if (destinyValue == null || destinyValue == "") {
        alert("Es necesario que ingreses un destino")
    } else if (originValue.toLowerCase() == destinyValue.toLowerCase()) {
        alert("Es necesario que ingreses un origen y destino distintos")
    } else if (cities.find(element => element.name.toLowerCase() == originValue.toLowerCase()) == null || cities.find(element => element.name.toLowerCase() == destinyValue.toLowerCase()) == null) {
        alert("Todavía no tenemos presencia en esa ciudad")
    } else {
        origin = cities.find(element => element.name.toLowerCase() == originValue.toLowerCase()).name
        destiny = cities.find(element => element.name.toLowerCase() == destinyValue.toLowerCase()).name
        return true
    }
}

//////////////////////////////////////////////////////
/*********************** Dates **********************/
/////////////////////////////////////////////////////

// Set min date
departureDate.attr("min", new Date().toISOString().split("T")[0])
returnDate.attr("min", new Date().toISOString().split("T")[0])

departureDate.change (function() {
    returnDate.attr("min", new Date(departureDate.val()).toISOString().split("T")[0])
})

// Verify dates
const verifyDates = () => {
    let startValue = $("#departure-date").val()
    let returnValue = $("#return-date").val()
    if (startValue == null || startValue == "") {
    } else if (flightValue == 1) {
        if (returnValue == null || returnValue == "") {
            alert("Ingresa una fecha de regreso")
        } else if (startValue > returnValue) {
            alert("Es necesario que ingreses una fecha de regreso mayor a la de salida")
        } else {
            departure = startValue
            returnSelected = returnValue
            return true
        }
    } else {
        departure = startValue
        return true
    }
}

//////////////////////////////////////////////////////
/*********************** Search *********************/
/////////////////////////////////////////////////////

//Verify complete data
button.click(function() {
    if (verifyCities() && verifyDates()) {
        createQuote()
    }
})

//////////////////////////////////////////////////////
/*********************** Quote **********************/
/////////////////////////////////////////////////////

class Quotation {
    constructor(id, flyOption, origin, destiny, departureDate, returnDate, passengers) {
        this.id = id
        this.flyOption = flyOption
        this.origin = origin
        this.destiny = destiny
        this.departureDate = departureDate
        this.returnDate = returnDate
        this.passengers = passengers
    }

    saveQuotation() {
        quotes = JSON.parse(localStorage.getItem("quotes"))
        if (quotes == null) {
            quotes = []
        }
        quotes.push(this)
        localStorage.setItem("quotes", JSON.stringify(quotes))
       // let result = JSON.parse(localStorage.getItem("quotes"))
    }

    showQuotation() {

        let flyType = "Sencillo"
        let message = ""
        if (this.flyOption == 1) {
            message = `<p>Fecha de regreso: ${this.returnDate}</p>`
            flyType = "Redondo"
        } 
        if (resultsContainer.has("div").length != 0) {
            resultsContainer.empty()
        }
        let quote = `<div class='quote-container'><h2>Los datos de tu cotización de vuelo son:</h2>
                            <p>Tipo de vuelo: ${flyType}</p>
                            <p>Origen: ${this.origin}</p>
                            <p>Destino: ${this.destiny}</p>
                            <p>Fecha de salida: ${this.departureDate + message}</p>
                            <p>Pasajeros: ${this.passengers}</p>
                            <br><hr>
                            </div>` 
        resultsContainer.append(quote)
    }
}

// Create quote
const createQuote = () => {
    let passengers = $('#passengers-select').val()
    let quotation = new Quotation((quotes.length + 1), flightValue, origin, destiny, departure, returnSelected, passengers)
    quotation.saveQuotation()
    quotation.showQuotation()
    recomendedFlights(quotation)
}

//////////////////////////////////////////////////////
/********************** Results *********************/
/////////////////////////////////////////////////////

// Flights
class Flight {
    constructor(id, idQuote, airline, origin, destiny, date, price) {
        this.id = id
        this.idQuote = idQuote
        this.airline = airline
        this.origin = origin
        this.destiny = destiny
        this.date = date
        this.price = price
    }

    showFlight() {
        let detail = `<div class="row align-items-center result result${this.id}">
                        <div class="col">
                            <div class="airline">
                                <img src="${this.airline.image}" width="120px">
                            </div>
                        </div>
                        <div class="col">
                            <div class="result-destiny">
                                <p>Origen: ${this.origin}</p>
                                <p>Destino: ${this.destiny}</p>
                                <p>Fecha: ${this.date}</p>
                            </div>
                        </div>
                        <div class="col result-price">
                            <p class="price">Precio: <b>$${this.price}</b></p>
                            <p class="price-small">x persona</p>
                            <button type="button" class="btn btn-primary btn${this.id}" onclick="addFlightToCart(this, ${this.id})">Seleccionar</button>
                        </div>
                    </div>`

        resultsContainer.append(detail)
        $(`.result`).animate({opacity: '1'}, "slow")
    }
}

// Random number
const randomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min
}

// Show Results
const recomendedFlights = (quotation) => {
   
    resultsContainer.append(`<h2 class="result-header">Vuelos de ida</h2>`)

    for (let index = 0; index < randomNumber(3, 10); index++) {
       let flight = new Flight((flights.length + 1), quotation.id, airlines[randomNumber(0, airlines.length)], quotation.origin, quotation.destiny, quotation.departureDate, (Math.floor(Math.random() * 1000)))
       flights.push(flight)
       flight.showFlight()
    }
    
    if (quotation.flyOption == 1) {
        resultsContainer.append(`<h2 class="result-header">Vuelos de regreso</h2>`)
        for (let index = 0; index < randomNumber(3, 10); index++) {
            let flight = new Flight((flights.length + 1), quotation.id, airlines[randomNumber(0, airlines.length)], quotation.destiny, quotation.origin, quotation.returnDate, (Math.floor(Math.random() * 1000)))
            flights.push(flight)
            flight.showFlight()
         }
    }
}

// Select Flight
function addFlightToCart(buton, flightId) {
    let selectedFlight = flights.find(element => element.id == flightId)
    $(`.btn${selectedFlight.id}`).hide()
    flightsSelected.push(selectedFlight)
    let hideFlights = flights.filter(element => (element.origin == selectedFlight.origin && element.id != selectedFlight.id))

    hideFlights.forEach((flight) => {
        $(`.result${flight.id}`).hide() 
    })
    verifyFlights(selectedFlight)
}

//////////////////////////////////////////////////////
/********************** Tickets *********************/
/////////////////////////////////////////////////////

const verifyFlights = (flight) => {
    let quote = quotes.find(element => element.id == flight.idQuote)
    if ((quote.flyOption == 1 && flightsSelected.length == 2) || (quote.flyOption == 2 && flightsSelected.length == 1)) {
        resultsContainer.append(`<div class="button-container"><button type="button" class="btn btn-primary buy-button" onclick="buy(this, ${quote.id})">Comprar</button></div>`)
    } 

}

function buy(elemento, quoteId) {
    let quote = quotes.find(element => element.id == quoteId)
    let flight = flightsSelected.find(element => element.origin == quote.origin)

    $(".button-container").hide()
    ticketsContainer.show()
    createTicket(quote, flight)
    if (quote.flyOption == 1) {
        let flight = flightsSelected.find(element => element.origin == quote.destiny)
        createTicket(quote, flight)
    }
}

const createTicket = (quote, flight) => {
    let ticket = `<div class="ticket-container container">
                    <div class="row">
                        <div class="col">
                            <p class="ticket-title">Boarding pass</p>
                        </div>
                    </div>
                    <div class="row tickets-data d-flex flex-wrap align-items-center">
                        <div class="col ticket-img">
                            <img src="./img/code.png">
                        </div>
                        <div class="col">
                            <p>De:${flight.origin}</p>
                            <p>A: ${flight.destiny}</p>
                            <p>Fecha: ${flight.date}</p>
                            <p>Aerolínea: ${flight.airline.name}</p>
                            <p>Pasajeros: ${quote.passengers}</p>
                        </div>
                        <div class="col">
                            <p>Precio x persona: $${flight.price}</p>
                            <p class="ticket-total">Total: $${flight.price * quote.passengers}</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <p class="ticket-date">Precio válido por una semana</p>
                        </div>
                    </div>
                </div>`
    ticketsContainer.append(ticket)
}

//////////////////////////////////////////////////////
/****************** Recent Searches *****************/
/////////////////////////////////////////////////////

// Show recent searches
const showRecents = () => {
    let storage = JSON.parse(localStorage.getItem("quotes"))
    let parent = $("#searches-recent").slideUp()
    if (storage != null) {
        if (storage.length > 0) {
            let title = $(".recent-title")
            title.css("display", "inline")
        }
        for (const object of storage) {
            quotes.push(new Quotation(object.id, object.flyOption, object.origin, object.destiny, object.departureDate, object.returnDate, object.passengers))
        }
        for (const quote of quotes) {
            parent.append(`<div class="col recent">
                                <div class="card mb-3">
                                    <div class="row g-0">
                                        <div class="col-md-6">
                                            <img src="${cities.find(element => element.name == quote.destiny).image}" class="img-fluid rounded-start recent-img" alt="...">
                                        </div>
                                        <div class="col-md-6">
                                            <div class="card-body">
                                            <h5 class="card-title">${quote.destiny}</h5>
                                            <p class="card-text">${quote.departureDate}</p>
                                            <p class="card-text"><small class="text-muted">Desde ${quote.origin}</small></p>
                                            <a href="#" class="btn-search" onclick="keepLooking(this, ${quote.id})">Seguir buscando &#10142</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`

            )
        } 
        parent.slideDown("slow")
    }
}

// Show detail from recent search
function keepLooking(element, quoteId) {
    let quote = quotes.find(element => element.id == quoteId)
    if (quote != null) {
        quote.showQuotation()
        recomendedFlights(quote)
    }
}









