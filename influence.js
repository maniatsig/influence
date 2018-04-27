var url;
var description;

//draws GeoChart when window loads and sets the values of url and description variables above
window.onload = function()
{
	show_content("geoinfluence");
}

//navigation event listeners
document.getElementById("geoinfluence").addEventListener("click", function()
{
    show_content("geoinfluence");
});

document.getElementById("dataload").addEventListener("click", function()
{
    show_content("dataload");
	
});

document.getElementById("info").addEventListener("click", function()
{
    show_content("info");
});

//function to show which menu item is selected
function show_content(selection)
{				
	if(selection=="geoinfluence")
	{
		document.getElementById("geoinfluence").classList.add("selected");
		document.getElementById("dataload").classList.remove("selected");
		document.getElementById("info").classList.remove("selected");
		show("chart");
		hide("data");
		hide("information");
		SetUrl();	
		DrawGeoChart();
	}
	else if (selection=="dataload")
	{
		document.getElementById("dataload").classList.add("selected");
		document.getElementById("geoinfluence").classList.remove("selected");
		document.getElementById("info").classList.remove("selected");
		hide("chart");
		show("data");
		hide("information");
		//LoadData();
	}
	else
	{
		document.getElementById("info").classList.add("selected");
		document.getElementById("geoinfluence").classList.remove("selected");
		document.getElementById("dataload").classList.remove("selected");
		hide("chart");
		hide("data");
		show("information");
		
	}
					
}

//function to hide an element
function hide(element){
	
	document.getElementById(element).style.display = "none";
}

//function to show an element
function show(element){
	
	document.getElementById(element).style.display = "block";
}

//function to define which data will the GeoChart show (by default it shows Google Merchandise Store's data)
function SetUrl() 
{
	window.localStorage.setItem("demo_url","https://docs.google.com/spreadsheets/d/14mX2xclCsk0TU6ls5UXTEseXQnVbAwMWFJX0-WqgpCw/edit?usp=sharing");
	window.localStorage.setItem("demo_description","Google Merchandise Store 2017 (Greece)");
	if (window.localStorage.getItem("user_url") == null)
	{
		url = window.localStorage.getItem("demo_url");
		description = window.localStorage.getItem("demo_description");
	}
	else
	{
		url = window.localStorage.getItem("user_url");
		description = window.localStorage.getItem("user_description");
	}
}
//function draw the GeoChart
function DrawGeoChart()
{					
	//loads packages from google
	google.charts.load('current', {'packages':['corechart']});
	google.charts.load('current', { 'packages': ['table'] });
	google.charts.load('current', {'packages': ['geochart'],'mapsApiKey': 'AIzaSyDFVVh5a6FcVa_Tm17LLeM8Ce3sinSpjo8'});
	
	//calls drawCharts fuction to get the data and draw the charts
	google.charts.setOnLoadCallback(drawCharts);

	function drawCharts() 
	{
		//gives a description to the chart (by default it is 'Google Merchandise Store')
		document.getElementById("chart_descr").innerHTML = description;
		
		//query to a specific shared google spreadsheet to get the user's google analytics data - the url is given by the user
		var queryString_user_data = encodeURIComponent('SELECT A, B, C OFFSET 6');
		var query_user_data = new google.visualization.Query(url+"/gviz/tq?sheet=Sheet1&headers=0&tq=" + queryString_user_data);

		//sends the query to handleUserQueryResponse function
		query_user_data.send(handleUserQueryResponse);
		
		function handleUserQueryResponse(response)
		{
			//check for error
			if (response.isError() || response.hasWarning())
			{
				document.getElementById('geochart').innerHTML = "Error in query: " + response.getMessage() + "  " + response.getDetailedMessage();
				return;
			}
			
		
			//gets the data after response and stores them to user_data datatable
			var user_data = response.getDataTable();
			
			// removes the last row from user_data datatable because it shows total visits
			user_data.removeRow(user_data.getNumberOfRows()-1);
			
			//query to a specific shared google spreadsheet to get the population data per city / region - the url is given bu the programmer
			var queryString_population_data = encodeURIComponent('SELECT B, C, D OFFSET 1');
			var query_population_data = new google.visualization.Query("https://docs.google.com/spreadsheets/d/1L6EpPIFE4raJnTEKfKmJiAfU9TrSO6LSMgBBJ_Y30og/edit?usp=sharing"+"/gviz/tq?sheet=Sheet1&headers=0&tq=" + queryString_population_data);
			
			//sends the query to handlePopulationQueryResponse function
			query_population_data.send(handlePopulationQueryResponse);
			
			
			function handlePopulationQueryResponse(response) 
			{
				//check for error
				if (response.isError() || response.hasWarning())
				{
					document.getElementById('geochart').innerHTML = "Error in query: " + response.getMessage() + "  " + response.getDetailedMessage();
					return;
				}
				//gets the data after response and stores them to population_data datatable
				var population_data = response.getDataTable();
				
				//a new datatable after inner join the datatables user_data and population_data on city id
				var joinedData = google.visualization.data.join(population_data, user_data, 'inner', [[1, 1]],[0,2], [2]);
				
				//sets column labels to joinedData table			
				joinedData.setColumnLabel(0, 'ID');
				joinedData.setColumnLabel(1, 'Name');
				joinedData.setColumnLabel(2, 'Population');
				joinedData.setColumnLabel(3, 'Visitors');
				
				
				//adds one more column to calculate influence (%)
				joinedData.addColumn('number', 'Influence(%)');					
				
				var lastrow = joinedData.getNumberOfRows();
				var i = 0;
				var region_influence;
				
				//gets values from joinedData table, calculates the Influence (%) column for each row and sets this value to influence column per row
				for(i=0;i<lastrow;i++)
				{
					
						region_influence = (joinedData.getValue(i,3) / joinedData.getValue(i,2)) *100 ;
						joinedData.setCell(i,4, region_influence);
					
				}
				
				//var chart2 = new google.visualization.Table(document.getElementById('columnchart2'));
				//chart2.draw(joinedData, null);
				
				//removes the id and population column to create the final datatable for geochart
				joinedData.removeColumn(0);
				joinedData.removeColumn(1);
						
				
				//options for GeoChart
				var geo_options = {
					
				region: 'GR',
				displayMode: 'markers',
				colorAxis: {colors: ['green', 'blue']},
				legend: {textStyle: {color: 'blue', fontSize: 16}}
				
				};
				
				//draw GeoChart
				var chart = new google.visualization.GeoChart(document.getElementById('geochart'));
				chart.draw(joinedData, geo_options);

			}		
		}		
	}

}

//function to check if url is valid
function checkUrl(given_url) {
	  
	  if(given_url.match("https://docs.google.com/spreadsheets/"))
	  {
		  return true;
	  }
	  else
	  {
		  return false;
	  }
}



//lets the user set his own data
function LoadData()	
{
	//takes the url and description from form
	if(checkUrl(document.forms["UserData"].users_url.value))
	{
		window.localStorage.setItem("user_url", document.forms["UserData"].users_url.value);
		window.localStorage.setItem("user_description", document.forms["UserData"].descr.value);
		document.getElementById("UserData").reset();
		document.getElementById("url_label").style.color='black';
		show_content("geoinfluence");
	}
	else
	{
		document.getElementById("url_label").style.color='red';
		document.getElementById("UserData").reset();
	}
}

//function to reset to defaults
function reset_def()
{
	window.localStorage.clear();

}