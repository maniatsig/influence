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
	window.localStorage.setItem("demo_description","Google Merchandise Store");
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
			if (response.isError())
			{
				alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
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
				if (response.isError())
				{
					alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
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
				var inf;
				
				//gets values from joinedData table, calculates the Influence (%) column for each row and sets this value to influence column per row
				for(i=0;i<lastrow;i++)
				{
					
						inf = (joinedData.getValue(i,3) / joinedData.getValue(i,2)) *100 ;
						joinedData.setCell(i,4, inf);
						//dataarray+="\'"+joinedData.getValue(i,j)+"\'"+",";
					
				}
				var chart2 = new google.visualization.Table(document.getElementById('columnchart2'));
				
				//removes the id and population column to create the final datatable for geochart
				joinedData.removeColumn(0);
				joinedData.removeColumn(1);
				
				//chart2.draw(joinedData, null);
				
				var geo_options = {
					
				region: 'GR',
				displayMode: 'markers',
				colorAxis: {colors: ['green', 'blue']},
				legend: {textStyle: {color: 'blue', fontSize: 16}}
				
				};
				
				var col_options = {
				title: 'Motivation and Energy Level Throughout the Day',
				trendlines: {
				0: {type: 'linear', lineWidth: 5, opacity: .3},
				1: {type: 'exponential', lineWidth: 10, opacity: .3}
				},
				
				vAxis: {
				title: 'Rating (scale of 1-10)'
				}
				};
				//result.addRow([123, 'xaxa', null, 4,2]);
				
				var chart = new google.visualization.GeoChart(document.getElementById('geochart'));
				chart.draw(joinedData, geo_options);
				
				//var chart3 = google.visualization.ColumnChart(document.getElementById('columnchart3'));
				//chart3.draw(joinedData, null);
				//chart1.draw(user_data, null);
				
				

				
			}		
		}		
}

/*
  var data = google.visualization.arrayToDataTable([
	['ID', 'Life Expectancy', 'Fertility Rate', 'Region',     'Population'],
	['CAN',    80.66,              1.67,      'North America',  33739900],
	['DEU',    79.84,              1.36,      'Europe',         81902307],
	['DNK',    78.6,               1.84,      'Europe',         5523095],
	['EGY',    72.73,              2.78,      'Middle East',    79716203],
	['GBR',    80.05,              2,         'Europe',         61801570],
	['IRN',    72.49,              1.7,       'Middle East',    73137148],
	['IRQ',    68.09,              4.77,      'Middle East',    31090763],
	['ISR',    81.55,              2.96,      'Middle East',    7485600],
	['RUS',    68.6,               1.54,      'Europe',         141850000],
	['USA',    78.09,              2.05,      'North America',  307007000]
  ]);

  var options = {
	title: 'Correlation between life expectancy, fertility rate ' +
		   'and population of some world countries (2010)',
	hAxis: {title: 'Life Expectancy'},
	vAxis: {title: 'Fertility Rate'},
	bubble: {textStyle: {fontSize: 11}}
  };
  //var view = new google.visualization.DataView(data);

  var chart = new google.visualization.BubbleChart(document.getElementById('columnchart'));
  chart.draw(data, options);
}
*/

}


//function to check if url is valid
function checkUrl(given_url) {
	  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
	  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name and extension
	  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
	  '(\\:\\d+)?'+ // port
	  '(\\/[-a-z\\d%@_.~+&:]*)*'+ // path
	  '(\\?[;&a-z\\d%@_.,~+&:=-]*)?'+ // query string
	  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
	  return pattern.test(given_url);
}


//lets the user set his own data
function LoadData()	
{
	//takes the url and description from form
	if(checkUrl(document.forms["UserData"].users_url.value))
	{
		
		//url = 
		//description = 
		window.localStorage.setItem("user_url", document.forms["UserData"].users_url.value);
		window.localStorage.setItem("user_description", document.forms["UserData"].descr.value);
		document.getElementById("UserData").reset();
		document.getElementById("url_label").style.color='black';
		show_content("geoinfluence");
	}
	else
	{
		//alert("Please enter a valid Google Spreadsheet URL");
		//document.getElementById("url_label").innerHTML = "Please enter a valid Google Spreadsheet URL";
		document.getElementById("url_label").style.color='red';
		document.getElementById("UserData").reset();
	}
}

//function to show i-nfluence info
function show_info()
{
	window.localStorage.clear();
	//SetUrl();	
	//show_content("geoinfluence");
}