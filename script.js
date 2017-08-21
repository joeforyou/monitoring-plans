var $ = jQuery;
// Helper functions.
function formatDate(date){
    if(date){
        var day = date.slice(8,10);
        var month = date.slice(5,7);
        var year = date.slice(0,4);
        return month + "/" + day + "/" + year;
    } else { return "";}
}
function formatDateTime(date){
    if(date){
        var day = date.slice(8,10);
        var month = date.slice(5,7);
        var year = date.slice(0,4);
        var hour = date.slice(11,13);
        return month + "/" + day + "/" + year + ": " + hour;
    }
    else { return "";}
}
function formatYYYYQ(str){
    if(str) { return str.toString().slice(0,4) + ", Q:" + str.toString().slice(4,5); }
    else { return "";}
}
$(document).ready(function(e){
    // Initialize variables.
    var defaultTableParams = {
        paging: false,
        searching: false,
        info: false,
        ordering: false
    };
    var selectedFacility;
    var mp;
    var facilityMap;
    // Load the data.
    var key = "oV6yfSdpVE6saoLGnmGV9VGleFSHbssqpYNJZxAN";
    var facilitiesURL = "https://api.data.gov/TEST/epa/FACT/1.0/facilities?api_key="+key;
    // Hide stuff.
    $("#allContent").hide();
    $("footer").hide();
    $.ajax({
            url: facilitiesURL,
            type: "GET",
            dataType: "json",
            beforeSend: function(){
                $("#loadingMessage").html("<h2>Loading...</h2>");
            },
            success: function(res){
                $("#loadingMessage").hide();
                $("#allContent").show();
                $("footer").show();
                var facilities = res.data;
                // Instantiate tables.
                var facilitiesTable = $("#facilitiesTable").DataTable({
                    lengthMenu: [[100,250,500,-1],[100,250,500,"All"]],
                    scrollY: "80vh",
                    scrollCollapse: true,
                    data: facilities,
                    columns:[
                        {"data":"orisCode"},
                        {"data":"name"},
                        {"data":"state.name"}                    ]
                });
                // Data from facilities API Call.
                var unitsTable = $("#unitsTable").DataTable({
                    paging: false,
                    searching: false,
                    info: false,
                    columnDefs:[{className: "operatingStatus", "targets":[2]}]
                });
                var monitoringPlansTable = $("#monitoringPlansTable").DataTable({
                    paging: false,
                    searching: false,
                    info: false,
                    columnDefs:[{className: "status", "targets":[1]}]
                });
                // Data from monitoring plans API Call.
                var reportingFrequencyTable = $("#reportingFrequencyTable").DataTable(defaultTableParams);
                var monitoringLocationAttributesTable = $("#monitoringLocationAttributesTable").DataTable(defaultTableParams);
                var stackPipesUnitRelationshipsTable = $("#stackPipesUnitRelationshipsTable").DataTable(defaultTableParams);
                var unitOperationsTable = $("#unitOperationsTable").DataTable(defaultTableParams);
                var unitProgramsTable = $("#unitProgramsTable").DataTable(defaultTableParams);
                var unitFuelsTable = $("#unitFuelsTable").DataTable(defaultTableParams);
                var unitControlsTable = $("#unitControlsTable").DataTable(defaultTableParams);
                var monitoringMethodsTable = $("#monitoringMethodsTable").DataTable(defaultTableParams);
                var ms1;
                var ms2;
                var spanValuesTable = $("#spanValuesTable").DataTable(defaultTableParams);
                var systemFuelFlowTable = $("#systemFuelFlowTable").DataTable(defaultTableParams);
                var analyzerRangesTable = $("#analyzerRangesTable").DataTable(defaultTableParams);
                var emissionsFormulasTable = $("#emissionsFormulasTable").DataTable(defaultTableParams);
                var rectangularDuctTable = $("#rectangularDuctTable").DataTable(defaultTableParams);
                var loadOperatingInfoTable = $("#loadOperatingInfoTable").DataTable(defaultTableParams);
                var monitoringDefaultsTable = $("#monitoringDefaultsTable").DataTable(defaultTableParams);
                var qualificationsTable = $("#qualificationsTable").DataTable(defaultTableParams);
                var commentsTable = $("#commentsTable").DataTable(defaultTableParams);
                function makeDateForYYYYQ(yearQuarter){
                    if(yearQuarter){
                        var date = "";
                        var q = yearQuarter.toString().slice(4);
                        if (q == "1"){date = "01-01-"+yearQuarter.toString().slice(0,4);}
                        else if(q == "2"){date = "04-01-"+yearQuarter.toString().slice(0,4);}
                        else if(q == "3"){date = "07-01-"+yearQuarter.toString().slice(0,4);}
                        else if(q == "4"){date = "10-01-"+yearQuarter.toString().slice(0,4);}
                        console.log(date)
                        return date;
                    } else { return "";}
                }
                function createUnitStackName(data){
                    var planNames = [];
                    var i;
                    for(i = 0; i < data.length; i+=1){
                        planNames.push(data[i].name);
                    }
                    return planNames.sort().toString();
                }
                // Display functions for all facility-level information.
                function displayMap(facility){
                    if(facility.geographicLocation.isValid){
                        facilityMap = L.map("facilityMap");
                        L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	                        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            //accessToken: "pk.eyJ1Ijoiam9lZm9yeW91IiwiYSI6ImNqM2c3YzAycDAwM3MzMm8wbjg2a3RpcncifQ.FaL8cuXKk4K9zzrUGzNTDA"
                        }).addTo(facilityMap);

                        var marker = L.marker([facility.geographicLocation.latitude,facility.geographicLocation.longitude]).addTo(facilityMap);
                        facilityMap.setView([facility.geographicLocation.latitude,facility.geographicLocation.longitude], 16);
                        facilityMap.invalidateSize(false);
                    }
                }
                function displayBasicFacilityInfo(facility){
                    var county;
                    var state;
                    var region;
                    $("#orisCode").html("<strong>ORIS:</strong> "+facility.orisCode);
                    $("#facilityName").html(facility.name);
                    $("#basicFacilityInfo").show();
                    $("#facilityMap").show();
                    if(facility.county){
                        county = facility.county.name;
                    } else {county = "N/A";}
                    if(facility.state){
                        state = facility.state.name;
                    } else {state = "N/A";}
                    if(facility.region){
                        region = facility.region.id;
                    } else {region = "N/A";}
                    $("#basicFacilityInfo").html(
                        "<div class='row cols-4'><div class='col'><h3>"+"County</h3><p>" +county+"</p></div>"+
                        "<div class='col'><h3>"+"State</h3>"+"<p>"+state+"</p></div>"+
                        "<div class='col'><h3>"+"EPA Region</h3><p>"+region+"</p></div>"+
                        "<div class='col'>"+"<img width='50%' src='./Monitoring_Plan_Viewer_USEPA_files/region"+facility.region.id+".png'>"+"</div></div>"+
                        "<div id='facilityMap' style='height: 50vh'></div>"
                    );
                    displayMap(facility);
                }
                function displayContacts(facility){
                    // Display the facility's contact(s).
                    var contactsHTML = [];
                    contactsHTML.push("<div class='box multi news' id='owners'></div>");
                    for(var i = 0; i < facility.contacts.length; i+=1){
                        contactsHTML.push(
                            "<div class='row cols-2'>"+
                                "<h3 style='text-align:center;'>"+facility.contacts[i]["firstName"] + " "+ facility["contacts"][i]["lastName"]+"</h3><hr>"+
                                "<div class='col'>"+
                                    "<p><strong>Title:</strong> "+facility.contacts[i]["jobTitle"]+"<br>"
                                    +"<strong>Company:</strong> "+facility.contacts[i]["companyName"]+"<br>"
                                    +"<strong>Email:</strong> "+"<a href="+ facility.contacts[i]["emailAddress"]+">"+facility["contacts"][i]["emailAddress"]+"</a>"+"<br>"
                                    +"<strong>Phone:</strong> "+facility.contacts[i]["phoneNumber"]+"<br>"
                                    +"<strong>Address:</strong> "+facility.contacts[i]["address1"] + ", " + facility["contacts"][i]["address2"]+"<br>"
                                    +facility.contacts[i]["city"] +", "+ facility.contacts[i]["stateAbbreviation"] + " " + facility["contacts"][i]["zipCode"]+"</p>"+
                                "</div>"+
                                "<div class='box multi col' id='respDiv'>"+
                                    "<ul id='resp"+i+"'"+"></ul>"+
                                "</div>"+
                            "</div>"
                        );
                    }
                    $("#contacts").html(contactsHTML.join(""));
                    for(var i = 0; i < facility.contacts.length; i+=1){
                        var responsibilitiesHTML = ["<strong>Responsibilities:</strong>"];
                        for(var j = 0; j < facility.contacts[i]["responsibilities"].length; j+=1){
                            if(facility.contacts[i]["responsibilities"][j]["program"]){
                                responsibilitiesHTML.push("<li>"+facility.contacts[i]["responsibilities"][j]["program"]+ ": "+facility["contacts"][i]["responsibilities"][j]["role"] + "</li>");
                            }
                            else{
                                responsibilitiesHTML.push("<li>"+facility.contacts[i]["responsibilities"][j]["role"]+"</li>");
                            }
                        }
                        $("#resp"+i).html(responsibilitiesHTML.join(""));
                    }
                }
                function displayOwners(facility){
                    // Display the facility's owner(s).
                    var owners = facility.owners;
                    var ownersHTML = [];
                    var names = [];
                    for(var i = 0; i < owners.length; i+=1){
                        if(names.indexOf(owners[i]["companyName"]) == -1){
                            names.push(owners[i]["companyName"]);
                        }
                    }
                    var roles = [];
                    var units = [];
                    for(var i = 0; i < names.length; i+=1){
                        for(var j = 0; j < owners.length; j+=1){
                            if(roles.indexOf(owners[j]["ownerDescription"]) == -1){
                                roles.push(owners[j]["ownerDescription"]);
                            }
                            //console.log(owners[i])
                            if(units.indexOf(owners[j]["unitId"]) == -1){
                                units.push(owners[j]["unitId"]);
                            }
                        }
                    ownersHTML.push("<h2 class='pane-title'>"+names[i]+"</h2>");
                    ownersHTML.push("<p><strong>Role:</strong> "+roles+"<br>");
                    ownersHTML.push("<strong>Unit(s)</strong>: "+units.join(", ")+"</p>");
                    }
                    $("#owners").html(ownersHTML.join(""));
                }
                function displayUnits(facility){
                    unitsTable.clear();
                    $("#operatingUnitsToggle").prop("checked",true);
                    // Display the facility's unit(s).
                    for(var i = 0; i < facility.units.length; i+=1){
                        unitsTable.row.add([
                            facility.units[i]["unitId"],
                            formatDate(facility.units[i]["commOpDate"]),
                            facility.units[i]["status"]
                        ]);
                    }
                    unitsTable.draw();
                    $("#unitsTable tr td.operatingStatus").each(function(){
                        if($(this).html() !== "Operating"){
                            $(this).closest("tr").hide();
                        }
                        else {
                            $(this).closest("tr").show();
                        }
                    });
                }
                function clearUnitInfo(){
                    $("#unitInfo").html("");
                    $("#unitFuels").html("");
                    $("#unitControls").html("");
                    $("#unitPrograms").html("");
                    $("#generatorsTable").html("");
                    $("#unitReport").hide();
                }
                function displayUnitInfo(facility,unit){
                    var unitInfo = {}
                    for(var i = 0; i < facility.units.length; i+=1){
                        if(unit[0] == facility.units[i]["unitId"]){
                            unitInfo = facility.units[i];
                        }
                    }
                    $("#unitReport").show();
                    //console.log(unitInfo);
                    var controls = "";
                    var programs = [];
                    var fuels = [];
                    $("#unitInfo").html(
                            "<p><strong style='font-size:1.3em'>Unit ID: "+unitInfo["unitId"]+"</strong><hr>"+
                            "<strong>Status:</strong> "+unitInfo["status"]+"<br>"+
                            "<strong>Status Date:</strong> " +formatDate(unitInfo["statusDate"]) +"<br>"+
                            "<strong>Heat Input Capacity (mmBtu/hr):</strong> "+unitInfo["hi"]+"</p><br>"+"<hr>"
                    );
                    if(unitInfo["fuels"].length > 0){
                        for (var i = 0; i < unitInfo["fuels"].length; i+=1){
                            fuels.push("<strong>"+unitInfo["fuels"][i]["indicatorDescription"]+" Fuel:</strong> " + unitInfo["fuels"][i]["fuelDescription"]);
                        }
                        $("#unitFuels").html("<p>"+fuels.join("<br>") + "</p><hr>");
                    }
                    if(unitInfo["controls"].length > 0){
                        for (var i = 0; i < unitInfo["controls"].length; i+=1){
                            controls += "<strong>"+unitInfo["controls"][i]["calErrorParameter"] + " Controls:</strong> " + unitInfo["controls"][i]["description"] + "<br>"
                        }
                        $("#unitControls").html("<p>" + controls + "</p><hr>");
                    }
                    if(unitInfo["programs"].length > 0){
                        for (var i = 0; i < unitInfo["programs"].length; i+=1){
                            programs.push(unitInfo["programs"][i]["description"]);
                        }
                        $("#unitPrograms").html("<p><strong>"+"Programs:</strong> " + programs.join(", ") + "<hr></p>");
                    }
                    if(unitInfo["generators"].length > 0){
                        $("#generatorsTable").html(
                            "<thead>"+
                                    "<tr>"+
                                        "<th>Generator ID</th>"+
                                        "<th>Nameplate Capacity (MW)</th>"+
                                    "</tr>"+
                                "</thead>"+
                            "<tbody id='generatorsTableBody'></tbody>"
                        );
                        generators = [];
                        for (var i = 0; i < unitInfo["generators"].length; i +=1){
                            generators.push("<tr><td>"+unitInfo["generators"][i]["generatorId"]+"</td>");
                            generators.push("<td>"+unitInfo["generators"][i]["nameplateCapacity"]+"</td></tr>");
                        }
                        $("#generatorsTableBody").html(generators.join(""));
                    }
                }
                function displayMonitoringPlans(facility){
                    monitoringPlansTable.clear();
                    $("#activePlansToggle").prop("checked",true);
                    var monitoringPlans = facility["monitoringPlans"]
                    for(var i = 0; i < monitoringPlans.length; i+=1){
                        monitoringPlansTable.row.add([
                            createUnitStackName(monitoringPlans[i]["monitoringLocations"]),
                            monitoringPlans[i]["status"],
                            formatYYYYQ(monitoringPlans[i]["beginYearQuarter"]),
                            formatYYYYQ(monitoringPlans[i]["endYearQuarter"])
                        ]);
                    }
                    monitoringPlansTable.draw();

                    $("#monitoringPlansTable tr td.status").each(function(){
                        if($(this).html() !== "Active"){
                            $(this).closest("tr").hide();
                        }
                        else {
                            $(this).closest("tr").show();
                        }
                    })
                }
                // Display functions for the monitoring plan-level information.
                function getConfigType(unitStackStr){
                    if(unitStackStr.match("CS")){
                        return "common";
                    }
                    else if(unitStackStr.match("MS")){
                        return "multiple";
                    }
                    else{
                        return "simple";
                    }
                }
                function displayUnitAndStackRow(table, monLoc, cols){
                    if(monLoc["isUnit"]){
                        var list = [];
                        list.push("<span class='stackRow'>Unit ID: " +monLoc["name"]+"</span>");
                        for(var i = 0; i < cols; i+=1){
                            list.push("");
                        }
                        table.row.add(list);
                    }
                    else{
                        var list = []
                        list.push( "<span class='stackRow'>Stack/pipe ID: " +monLoc["name"]+"</span>");
                        for(var i = 0; i < cols; i+=1){
                            list.push("");
                        }
                        table.row.add(list);
                    }
                }
                function displayStackRow(table, monLoc, cols){
                    if(monLoc["isUnit"] == false){
                        var list = []
                        list.push("<span class='stackRow'>Stack/pipe ID: " +monLoc["name"]+"</span>");
                        for(var i = 0; i < cols; i+=1){
                            list.push("")
                        }
                        table.row.add(list)
                    }
                }
                function displayReportingFrequencyInfo(plan){
                    reportingFrequencyTable.clear();
                    for(var i = 0; i < plan["reportingFrequencies"].length; i+=1){
                        reportingFrequencyTable.row.add([
                            plan["unitStackName"],
                            plan["reportingFrequencies"][i]["reportFreq"],
                            formatYYYYQ(plan["reportingFrequencies"][i]["beginQtr"]),
                            formatYYYYQ(plan["reportingFrequencies"][i]["endQtr"])
                        ]);
                    }
                    reportingFrequencyTable.draw();
                }
                function displayMonitoringLocationAttributes(plan){
                    monitoringLocationAttributesTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        for(var j = 0; j < plan["monitoringLocations"][i]["locationAttributes"].length; j+=1){
                            displayUnitAndStackRow(monitoringLocationAttributesTable,plan["monitoringLocations"][i],9)
                            monitoringLocationAttributesTable.row.add([
                                plan["monitoringLocations"][i]["locationAttributes"][j]["ductInd"],
                                plan["monitoringLocations"][i]["locationAttributes"][j]["groundElevation"],
                                plan["monitoringLocations"][i]["locationAttributes"][j]["stackHeight"],
                                plan["monitoringLocations"][i]["locationAttributes"][j]["crossAreaExit"],
                                plan["monitoringLocations"][i]["locationAttributes"][j]["crossAreaFlow"],
                                plan["monitoringLocations"][i]["locationAttributes"][j]["material"],
                                plan["monitoringLocations"][i]["locationAttributes"][j]["shape"],
                                formatDate(plan["monitoringLocations"][i]["locationAttributes"][j]["beginDate"]),
                                plan["monitoringLocations"][i]["locationAttributes"][j]["endDate"]
                            ])
                        }
                    }
                    monitoringLocationAttributesTable.draw();
                }
                function displayStackPipesUnitRelationships(plan){
                    stackPipesUnitRelationshipsTable.clear();
                    //console.log(plan)
                    //for (var j = 0; j < plan["monitoringLocations"].length; j+=1){
                    if(getConfigType(plan["unitStackName"]) == "common"){
                        displayStackRow(stackPipesUnitRelationshipsTable, plan["monitoringLocations"][plan["monitoringLocations"].length - 1],6)
                        for(var i = 0; i < plan["unitStackConfigurations"].length; i+=1){
                            stackPipesUnitRelationshipsTable.row.add([
                                plan["unitStackConfigurations"][i]["unitId"],
                                plan["unitStackConfigurations"][i]["bypassInd"],
                                formatDate(plan["unitStackConfigurations"][i]["activeDate"]),
                                formatDate(plan["unitStackConfigurations"][i]["retireDate"]),
                                formatDate(plan["unitStackConfigurations"][i]["beginDate"]),
                                formatDate(plan["unitStackConfigurations"][i]["endDate"])
                            ])
                        }
                    }
                    else if(getConfigType(plan["unitStackName"]) == "multiple"){
                        for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                            if(getConfigType(plan["monitoringLocations"][i]["name"]) == "multiple"){
                                displayUnitAndStackRow(stackPipesUnitRelationshipsTable,plan["monitoringLocations"][i],6)
                                for(var j = 0; j < plan["unitStackConfigurations"].length; j+=1){
                                    if(plan["unitStackConfigurations"][j]["unitStack"] == plan["monitoringLocations"][i]["name"]){
                                        stackPipesUnitRelationshipsTable.row.add([
                                            plan["unitStackConfigurations"][j]["unitId"],
                                            plan["unitStackConfigurations"][j]["bypassInd"],
                                            formatDate(plan["unitStackConfigurations"][j]["activeDate"]),
                                            formatDate(plan["unitStackConfigurations"][j]["retireDate"]),
                                            formatDate(plan["unitStackConfigurations"][j]["beginDate"]),
                                            formatDate(plan["unitStackConfigurations"][j]["endDate"])
                                        ]);
                                    }
                                }
                            }
                        }
                    }
                    stackPipesUnitRelationshipsTable.draw();
                }
                function displayUnitOperations(plan){
                    unitOperationsTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        if(plan["monitoringLocations"][i]["isUnit"]){
                            unitOperationsTable.row.add([
                                "<span class='stackRow'>Unit ID: " +plan["monitoringLocations"][i]["name"]+"</span>", "","","","","","",""
                            ])
                        }
                        for(var j = 0; j < plan["monitoringLocations"][i]["unitOperations"].length; j+=1){

                            unitOperationsTable.row.add([
                                formatDate(plan["monitoringLocations"][i]["unitOperations"][j]["comrOpDate"]),
                                formatDate(plan["monitoringLocations"][i]["unitOperations"][j]["commOpDate"]),
                                plan["monitoringLocations"][i]["unitOperations"][j]["unitType"],
                                formatDate(plan["monitoringLocations"][i]["unitOperations"][j]["btBeginDate"]),
                                formatDate(plan["monitoringLocations"][i]["unitOperations"][j]["btEndDate"]),
                                plan["monitoringLocations"][i]["unitOperations"][j]["maxHICap"],
                                formatDate(plan["monitoringLocations"][i]["unitOperations"][j]["hiBeginDate"]),
                                formatDate(plan["monitoringLocations"][i]["unitOperations"][j]["hiEndDate"])
                            ])
                        }
                    }
                    unitOperationsTable.draw();
                }
                function displayUnitPrograms(plan){
                    unitProgramsTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        if(plan["monitoringLocations"][i]["isUnit"]){
                            unitProgramsTable.row.add([
                                "<span class='stackRow'>Unit ID: " +plan["monitoringLocations"][i]["name"]+"</span>", "","",""
                            ])
                        }
                        for(var j = 0; j < plan["monitoringLocations"][i]["unitPrograms"].length; j+=1){
                            unitProgramsTable.row.add([
                                plan["monitoringLocations"][i]["unitPrograms"][j]["name"],
                                plan["monitoringLocations"][i]["unitPrograms"][j]["class"],
                                formatDate(plan["monitoringLocations"][i]["unitPrograms"][j]["certificationBeginDate"]),
                                formatDate(plan["monitoringLocations"][i]["unitPrograms"][j]["certificationDeadline"])
                            ])
                        }
                    }
                    unitProgramsTable.draw();
                }
                function displayUnitFuels(plan){
                    unitFuelsTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        if(plan["monitoringLocations"][i]["isUnit"]){
                            unitFuelsTable.row.add([
                                "<span class='stackRow'>Unit ID: " +plan["monitoringLocations"][i]["name"]+"</span>", "","","","","",""
                            ])
                        }
                        for(var j = 0; j < plan["monitoringLocations"][i]["unitFuels"].length; j+=1){
                            unitFuelsTable.row.add([
                                plan["monitoringLocations"][i]["unitFuels"][j]["fuelDescription"],
                                plan["monitoringLocations"][i]["unitFuels"][j]["indicatorDescription"],
                                plan["monitoringLocations"][i]["unitFuels"][j]["demGCVDesc"],
                                plan["monitoringLocations"][i]["unitFuels"][j]["demSO2Desc"],
                                plan["monitoringLocations"][i]["unitFuels"][j]["ozoneSeasInd"],
                                formatDate(plan["monitoringLocations"][i]["unitFuels"][j]["beginDate"]),
                                formatDate(plan["monitoringLocations"][i]["unitFuels"][j]["endDate"])
                            ])
                        }
                    }
                    unitFuelsTable.draw();
                }
                function displayUnitControls(plan){
                    unitControlsTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        if(plan["monitoringLocations"][i]["isUnit"]){
                            unitControlsTable.row.add([
                                "<span class='stackRow'>Unit ID: " +plan["monitoringLocations"][i]["name"]+"</span>", "","","","","",""
                            ])
                        }
                        for(var j = 0; j < plan["monitoringLocations"][i]["unitControls"].length; j+=1){
                            unitControlsTable.row.add([
                                plan["monitoringLocations"][i]["unitControls"][j]["calErrorParamDesc"],
                                plan["monitoringLocations"][i]["unitControls"][j]["description"],
                                plan["monitoringLocations"][i]["unitControls"][j]["origInstallInd"],
                                plan["monitoringLocations"][i]["unitControls"][j]["seasControlInd"],
                                formatDate(plan["monitoringLocations"][i]["unitControls"][j]["installDate"]),
                                formatDate(plan["monitoringLocations"][i]["unitControls"][j]["optimDate"]),
                                formatDate(plan["monitoringLocations"][i]["unitControls"][j]["retireDate"])
                            ])
                        }
                    }
                    unitControlsTable.draw();
                }

                function displayMonitoringMethods(plan){
                    monitoringMethodsTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        displayUnitAndStackRow(monitoringMethodsTable,plan["monitoringLocations"][i],6)
                        for(var j = 0; j < plan["monitoringLocations"][i]["monitoringMethods"].length; j+=1){
                            monitoringMethodsTable.row.add([
                                plan["monitoringLocations"][i]["monitoringMethods"][j]["parameterCode"],
                                plan["monitoringLocations"][i]["monitoringMethods"][j]["methodCode"],
                                plan["monitoringLocations"][i]["monitoringMethods"][j]["subDataCode"],
                                plan["monitoringLocations"][i]["monitoringMethods"][j]["bypassApproachCode"],
                                formatDateTime(plan["monitoringLocations"][i]["monitoringMethods"][j]["beginDateHour"]),
                                formatDateTime(plan["monitoringLocations"][i]["monitoringMethods"][j]["endDateHour"])
                            ])
                        }
                    }
                    monitoringMethodsTable.draw();
                }
                function generateMonitoringSystemTables(plan){
                    var tableHTML = [];
                    var configType;
                    if(plan["unitStackName"].match("CS")){
                        configType = "common"
                        for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                            if(plan["monitoringLocations"][i]["isUnit"] == false){
                                tableHTML.push(
                                    "<p class='ms1"+i+"'"+"><span>Stack/pipe ID: "+plan["monitoringLocations"][i]["name"]+"</span></p>"+
                                    "<table id='ms1"+i+"'"+" class='ms1 stripe hover row-border' cellspacing='0' width='100%'>"+
                                        "<thead>"+
                                            "<tr>"+
                                                "<th>System ID</th>"+
                                                "<th>System type</th>"+
                                                "<th>System designation</th>"+
                                                "<th>Begin time</th>"+
                                                "<th>End time</th>"+
                                            "</tr>"+
                                        "</thead>"+
                                        "<tbody>"+
                                        "</tbody>"+
                                    "</table><hr>")
                            tableHTML.push(
                                "<table id='ms2"+i+"'"+" class='ms2 stripe hover row-border' cellspacing='0' width='100%'>"+
                                    "<thead>"+
                                        "<th>Comp. ID</th>"+
                                        "<th>Comp. type</th>"+
                                        "<th>Hg convert. ind.</th>"+
                                        "<th>Sample acquistion meth.</th>"+
                                        "<th>Basis code desc.</th>"+
                                        "<th>Manufacturer</th>"+
                                        "<th>Model or version</th>"+
                                        "<th>Serial no.</th>"+
                                        "<th>Begin time</th>"+
                                        "<th>End time</th>"+
                                    "</thead>"+
                                    "<tbody>"+
                                    "</tbody>"+
                                "</table>");
                            }
                        }
                    }
                    else if (plan["unitStackName"].match("MS")){
                        configType = "multiple"
                        for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                            if(plan["monitoringLocations"][i]["isUnit"] == false){
                                tableHTML.push(
                                "<p class='ms1"+i+"'"+">Stack/pipe ID: "+plan["monitoringLocations"][i]["name"]+"</p>"+
                                "<table id='ms1"+i+"'"+" class='ms1 stripe hover row-border' cellspacing='0' width='100%'>"+
                                            "<thead>"+
                                                "<tr><th>System ID</th>"+
                                                "<th>System type</th>"+
                                                "<th>System designation</th>"+
                                                "<th>Begin time</th>"+
                                                "<th>End time</th></tr>"+
                                            "</thead>"+
                                            "<tbody>"+
                                            "</tbody>"+
                                        "</table><hr>");
                            }
                            else{
                                tableHTML.push(
                                "<p class='ms1"+i+"'"+">Unit ID: "+plan["monitoringLocations"][i]["name"]+"</p>"+
                                "<table id='ms1"+i+"'"+" class='ms1 stripe hover row-border' cellspacing='0' width='100%'>"+
                                            "<thead>"+
                                                "<tr><th>System ID</th>"+
                                                "<th>System type</th>"+
                                                "<th>System designation</th>"+
                                                "<th>Begin time</th>"+
                                                "<th>End time</th></tr>"+
                                            "</thead>"+
                                            "<tbody>"+
                                            "</tbody>"+
                                        "</table><hr>");
                            }
                            tableHTML.push("<table id='ms2"+i+"'"+" class='ms2 stripe hover row-border' cellspacing='0' width='100%'>"+
                                            "<thead>"+
                                                "<th>Comp. ID</th>"+
                                                "<th>Comp. type</th>"+
                                                "<th>Hg convert. ind.</th>"+
                                                "<th>Sample acquistion meth.</th>"+
                                                "<th>Basis code desc.</th>"+
                                                "<th>Manufacturer</th>"+
                                                "<th>Model or version</th>"+
                                                "<th>Serial no.</th>"+
                                                "<th>Begin time</th>"+
                                                "<th>End time</th>"+
                                            "</thead>"+
                                            "<tbody>"+
                                            "</tbody>"+
                                        "</table>");
                        }
                    }
                    else{
                        configType = "simple"
                        for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                            tableHTML.push(
                                "<p class='ms1"+i+"'"+">Unit ID: "+plan["monitoringLocations"][i]["name"]+"</p>"+
                                "<table id='ms1"+i+"'"+" class='ms1 stripe hover row-border' cellspacing='0' width='100%'>"+
                                            "<thead>"+
                                                "<tr><th>System ID</th>"+
                                                "<th>System type</th>"+
                                                "<th>System designation</th>"+
                                                "<th>Begin time</th>"+
                                                "<th>End time</th></tr>"+
                                            "</thead>"+
                                            "<tbody>"+
                                            "</tbody>"+
                                        "</table><hr>")
                            tableHTML.push("<table id='ms2"+i+"'"+" class='ms2 stripe hover row-border' cellspacing='0' width='100%'>"+
                                            "<thead>"+
                                                "<th>Comp. ID</th>"+
                                                "<th>Comp. type</th>"+
                                                "<th>Hg converter ind.</th>"+
                                                "<th>Sample acquistion method</th>"+
                                                "<th>Basis code desc.</th>"+
                                                "<th>Manufacturer</th>"+
                                                "<th>Model or version</th>"+
                                                "<th>Serial no.</th>"+
                                                "<th>Begin time</th>"+
                                                "<th>End time</th>"+
                                            "</thead>"+
                                            "<tbody>"+
                                            "</tbody>"+
                                        "</table>");
                        }
                    }
                    //console.log(configType, "this is the configuration type")
                    $("#monSystemDiv").html(tableHTML.join(""));
                    ms1 = $(".ms1").DataTable(defaultTableParams);
                    ms2 = $(".ms2").DataTable(defaultTableParams);
                }
                function displayMonitoringSystem(plan){
                    ms1.clear();
                    ms2.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        var sysIdArr = [];
                        var comIdArr = [];
                        var counter1 = 0;
                        var counter2 = 0;
                        for(var j = 0; j < plan["monitoringLocations"][i]["monitoringSystems"].length; j+=1){
                            if(plan["monitoringLocations"][i]["name"] == plan["monitoringLocations"][i]["monitoringSystems"][j]["locName"]){
                                if(sysIdArr.indexOf(plan["monitoringLocations"][i]["monitoringSystems"][j]["sysId"]) < 0){
                                    sysIdArr.push(plan["monitoringLocations"][i]["monitoringSystems"][j]["sysId"]);
                                }
                                if(counter1 < sysIdArr.length){
                                    ms1.table("#ms1"+i).row.add([
                                        plan["monitoringLocations"][i]["monitoringSystems"][j]["sysId"],
                                        plan["monitoringLocations"][i]["monitoringSystems"][j]["sysTypeCode"],
                                        plan["monitoringLocations"][i]["monitoringSystems"][j]["systemDesignationCodeDesc"],
                                        formatDateTime(plan["monitoringLocations"][i]["monitoringSystems"][j]["sysBeginDateHour"]),
                                        formatDateTime(plan["monitoringLocations"][i]["monitoringSystems"][j]["sysEndDateHour"])
                                    ]);
                                    counter1+=1
                                }
                                if(comIdArr.indexOf(plan["monitoringLocations"][i]["monitoringSystems"][j]["componentId"]) < 0){
                                    comIdArr.push(plan["monitoringLocations"][i]["monitoringSystems"][j]["componentId"]);
                                }
                                if(counter2 < comIdArr.length){
                                    ms2.table("#ms2"+i).row.add([
                                        plan["monitoringLocations"][i]["monitoringSystems"][j]["componentId"],
                                        plan["monitoringLocations"][i]["monitoringSystems"][j]["componentTypeCode"],
                                        plan["monitoringLocations"][i]["monitoringSystems"][j]["hgConverterInd"],
                                        plan["monitoringLocations"][i]["monitoringSystems"][j]["acqCode"],
                                        plan["monitoringLocations"][i]["monitoringSystems"][j]["basisCode"],
                                        plan["monitoringLocations"][i]["monitoringSystems"][j]["manufacturer"],
                                        plan["monitoringLocations"][i]["monitoringSystems"][j]["modelVersion"],
                                        plan["monitoringLocations"][i]["monitoringSystems"][j]["serialNum"],
                                        formatDateTime(plan["monitoringLocations"][i]["monitoringSystems"][j]["componentBeginDateHour"]),
                                        formatDateTime(plan["monitoringLocations"][i]["monitoringSystems"][j]["componentEndDateHour"])
                                    ]);
                                    counter2+=1
                                }
                            }
                        }
                    }
                    ms1.draw();
                    ms2.draw();
                }
                function displaySpanRangeValues(plan){
                    spanValuesTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        if (getConfigType(plan["unitStackName"]) == "common"){
                            displayStackRow(spanValuesTable,plan["monitoringLocations"][i],15)
                        }
                        else if(getConfigType(plan["unitStackName"]) == "multiple"){
                            displayUnitAndStackRow(spanValuesTable,plan["monitoringLocations"][i],15)
                        }
                        else if(getConfigType(plan["unitStackName"]) == "simple"){
                            displayUnitAndStackRow(spanValuesTable,plan["monitoringLocations"][i],15)
                        }
                        for(var j = 0; j < plan["monitoringLocations"][i]["spanDetails"].length; j+=1){
                            spanValuesTable.row.add([
                                plan["monitoringLocations"][i]["spanDetails"][j]["componentTypeCode"],
                                plan["monitoringLocations"][i]["spanDetails"][j]["spanScaleCode"],
                                plan["monitoringLocations"][i]["spanDetails"][j]["spanMethodCode"],
                                plan["monitoringLocations"][i]["spanDetails"][j]["mpcValue"] || plan["monitoringLocations"][i]["spanDetails"][j]["mpfValue"],
                                plan["monitoringLocations"][i]["spanDetails"][j]["mecValue"],
                                plan["monitoringLocations"][i]["spanDetails"][j]["spanValue"],
                                plan["monitoringLocations"][i]["spanDetails"][j]["fullScaleRange"],
                                plan["monitoringLocations"][i]["spanDetails"][j]["spanUOMCode"],
                                plan["monitoringLocations"][i]["spanDetails"][j]["flowSpanValue"],
                                plan["monitoringLocations"][i]["spanDetails"][j]["maxLowRange"],
                                plan["monitoringLocations"][i]["spanDetails"][j]["defaultHighRange"],
                                plan["monitoringLocations"][i]["spanDetails"][j]["flowFullScaleRange"],
                                formatDateTime(plan["monitoringLocations"][i]["spanDetails"][j]["beginDateHour"]),
                                formatDateTime(plan["monitoringLocations"][i]["spanDetails"][j]["endDateHour"])
                            ])
                        }
                    }
                    spanValuesTable.draw();
                }
                function displaySystemFuelFlow(plan){
                    systemFuelFlowTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        if (getConfigType(plan["unitStackName"]) == "common" && plan["monitoringLocations"][i]["systemFlows"].length > 0){
                            displayStackRow(systemFuelFlowTable,plan["monitoringLocations"][i],7)
                        }
                        else if(getConfigType(plan["unitStackName"]) == "multiple" && plan["monitoringLocations"][i]["systemFlows"].length > 0){
                            displayUnitAndStackRow(systemFuelFlowTable,plan["monitoringLocations"][i],7)
                        }
                        else if(getConfigType(plan["unitStackName"]) == "simple" && plan["monitoringLocations"][i]["systemFlows"].length > 0){
                            displayUnitAndStackRow(systemFuelFlowTable,plan["monitoringLocations"][i],7)
                        }
                        for(var j = 0; j < plan["monitoringLocations"][i]["systemFlows"].length; j+=1){
                            systemFuelFlowTable.row.add([
                                plan["monitoringLocations"][i]["systemFlows"][j]["sysId"],
                                plan["monitoringLocations"][i]["systemFlows"][j]["fuelCode"],
                                plan["monitoringLocations"][i]["systemFlows"][j]["maxRate"],
                                plan["monitoringLocations"][i]["systemFlows"][j]["sysFuelUOMCode"],
                                plan["monitoringLocations"][i]["systemFlows"][j]["maxRateSourceCode"],
                                formatDate(plan["monitoringLocations"][i]["systemFlows"][j]["beginDate"]),
                                formatDate(plan["monitoringLocations"][i]["systemFlows"][j]["endDate"])
                            ])
                        }
                    }
                    systemFuelFlowTable.draw();
                }
                function displayAnalyzerRanges(plan){
                    analyzerRangesTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        if (getConfigType(plan["unitStackName"]) == "common"){
                            displayStackRow(analyzerRangesTable,plan["monitoringLocations"][i],6)
                        }
                        else if(getConfigType(plan["unitStackName"]) == "multiple"){
                            displayUnitAndStackRow(analyzerRangesTable,plan["monitoringLocations"][i],6)
                        }
                        else if(getConfigType(plan["unitStackName"]) == "simple"){
                            displayUnitAndStackRow(analyzerRangesTable,plan["monitoringLocations"][i],6)
                        }
                        for(var j = 0; j < plan["monitoringLocations"][i]["analyzerRanges"].length; j+=1){
                            analyzerRangesTable.row.add([
                                plan["monitoringLocations"][i]["analyzerRanges"][j]["componentTypeCodeDesc"],
                                plan["monitoringLocations"][i]["analyzerRanges"][j]["componentId"],
                                plan["monitoringLocations"][i]["analyzerRanges"][j]["analyzerRangeCodeDesc"],
                                plan["monitoringLocations"][i]["analyzerRanges"][j]["dualRangeInd"],
                                formatDateTime(plan["monitoringLocations"][i]["analyzerRanges"][j]["beginDateHour"]),
                                formatDateTime(plan["monitoringLocations"][i]["analyzerRanges"][j]["endDateHour"])
                            ])
                        }
                    }
                    analyzerRangesTable.draw();
                }
                function displayEmisssionsFormulas(plan){
                    emissionsFormulasTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        displayUnitAndStackRow(emissionsFormulasTable,plan["monitoringLocations"][i],6)
                        for(var j = 0; j < plan["monitoringLocations"][i]["emissionsFormulas"].length; j+=1){
                            emissionsFormulasTable.row.add([
                                plan["monitoringLocations"][i]["emissionsFormulas"][j]["parameterCodeDesc"],
                                plan["monitoringLocations"][i]["emissionsFormulas"][j]["formulaId"],
                                plan["monitoringLocations"][i]["emissionsFormulas"][j]["equationCodeDesc"],
                                plan["monitoringLocations"][i]["emissionsFormulas"][j]["formulaEquation"],
                                formatDateTime(plan["monitoringLocations"][i]["emissionsFormulas"][j]["beginDateHour"]),
                                formatDateTime(plan["monitoringLocations"][i]["emissionsFormulas"][j]["endDateHour"])
                            ])
                        }
                    }
                    emissionsFormulasTable.draw();
                }
                function displayRectangularDuct(plan){
                    rectangularDuctTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        if (getConfigType(plan["unitStackName"]) == "common" && plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"].length > 0){
                            displayStackRow(rectangularDuctTable,plan["monitoringLocations"][i],11)
                        }
                        else if(getConfigType(plan["unitStackName"]) == "multiple" && plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"].length > 0){
                            displayUnitAndStackRow(rectangularDuctTable,plan["monitoringLocations"][i],11)
                        }
                        else if(getConfigType(plan["unitStackName"]) == "simple" && plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"].length > 0){
                            displayUnitAndStackRow(rectangularDuctTable,plan["monitoringLocations"][i],11)
                        }
                        for(var j = 0; j < plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"].length; j+=1){
                            rectangularDuctTable.row.add([
                                formatDate(plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"][j]["wafDeterminedDate"]),
                                formatDateTime(plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"][j]["wafEffectiveDatetime"]),
                                plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"][j]["wafMethodCode"],
                                plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"][j]["wafValues"],
                                plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"][j]["numTestRuns"],
                                plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"][j]["numTraversePointsWAF"],
                                plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"][j]["numTestPoints"],
                                plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"][j]["numTraversePointsRef"],
                                plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"][j]["ductWidth"],
                                plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"][j]["ductDepth"],
                                formatDateTime(plan["monitoringLocations"][i]["rectangularDuctWallEffectsAdjustmentFactors"][j]["endDateHour"])
                            ])
                        }
                    }
                    rectangularDuctTable.draw();
                }
                function displayLoadOperatingInfo(plan){
                    loadOperatingInfoTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        displayUnitAndStackRow(loadOperatingInfoTable,plan["monitoringLocations"][i],10)
                        for(var j = 0; j < plan["monitoringLocations"][i]["loadLevels"].length; j+=1){
                            loadOperatingInfoTable.row.add([
                                plan["monitoringLocations"][i]["loadLevels"][j]["maxLoadValue"],
                                plan["monitoringLocations"][i]["loadLevels"][j]["maxLoadUOMCode"],
                                plan["monitoringLocations"][i]["loadLevels"][j]["upperOpBound"],
                                plan["monitoringLocations"][i]["loadLevels"][j]["lowerOpBound"],
                                plan["monitoringLocations"][i]["loadLevels"][j]["normLvl"],
                                plan["monitoringLocations"][i]["loadLevels"][j]["secLvl"],
                                plan["monitoringLocations"][i]["loadLevels"][j]["secNormInd"],
                                formatDate(plan["monitoringLocations"][i]["loadLevels"][j]["loadAnalysisDate"]),
                                formatDateTime(plan["monitoringLocations"][i]["loadLevels"][j]["beginDateHour"]),
                                formatDateTime(plan["monitoringLocations"][i]["loadLevels"][j]["endDateHour"])
                            ])
                        }
                    }
                    loadOperatingInfoTable.draw();
                }
                function displayMonitoringDefaults(plan){
                    monitoringDefaultsTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        if (getConfigType(plan["unitStackName"]) == "common"){
                            displayStackRow(monitoringDefaultsTable,plan["monitoringLocations"][i],9)
                        }
                        else if(getConfigType(plan["unitStackName"]) == "multiple"){
                            displayUnitAndStackRow(monitoringDefaultsTable,plan["monitoringLocations"][i],9)
                        }
                        else if(getConfigType(plan["unitStackName"]) == "simple"){
                            displayUnitAndStackRow(monitoringDefaultsTable,plan["monitoringLocations"][i],9)
                        }
                        for(var j = 0; j < plan["monitoringLocations"][i]["monitoringDefaults"].length; j+=1){
                            monitoringDefaultsTable.row.add([
                                plan["monitoringLocations"][i]["monitoringDefaults"][j]["parameterCodeDesc"],
                                plan["monitoringLocations"][i]["monitoringDefaults"][j]["defaultValue"],
                                plan["monitoringLocations"][i]["monitoringDefaults"][j]["defaultUOMCode"],
                                plan["monitoringLocations"][i]["monitoringDefaults"][j]["defaultPurposeCodeDesc"],
                                plan["monitoringLocations"][i]["monitoringDefaults"][j]["fuelCode"],
                                plan["monitoringLocations"][i]["monitoringDefaults"][j]["opCondCode"],
                                plan["monitoringLocations"][i]["monitoringDefaults"][j]["defaultSourceCodeDesc"],
                                formatDateTime(plan["monitoringLocations"][i]["monitoringDefaults"][j]["beginDateHour"]),
                                formatDateTime(plan["monitoringLocations"][i]["monitoringDefaults"][j]["endDateHour"])
                            ])
                        }
                    }
                    monitoringDefaultsTable.draw();
                }
                function displayQualifications(plan){
                    qualificationsTable.clear();
                    for(var i = 0; i < plan["monitoringLocations"].length; i+=1){
                        for(var j = 0; j < plan["monitoringLocations"][i]["monitoringQualifications"].length; j+=1){
                            qualificationsTable.row.add([
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["qualTypeCode"],
                                formatDate(plan["monitoringLocations"][i]["monitoringQualifications"][j]["beginDate"]),
                                formatDate(plan["monitoringLocations"][i]["monitoringQualifications"][j]["endDate"]),
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["qualYear"],
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["avgPctValue"],
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["year1QualDataYear"],
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["year1QualDataTypeCode"],
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["year1PctValue"],
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["year2QualDataYear"],
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["year2QualDataTypeCode"],
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["year2PctValue"],
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["year3QualDataYear"],
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["year3QualDataTypeCode"],
                                plan["monitoringLocations"][i]["monitoringQualifications"][j]["year3PctValue"]
                            ])
                        }
                    }
                    qualificationsTable.draw();
                }
                function displayComments(plan){
                    commentsTable.clear();
                    for(var i = 0; i < plan["comments"].length; i+=1){
                        commentsTable.row.add([
                            plan["comments"][i]["unitStackPipe"],
                            plan["comments"][i]["monPlanComment"],
                            formatDate(plan["comments"][i]["beginDate"]),
                            formatDate(plan["comments"][i]["endDate"])
                        ])
                    }
                    commentsTable.draw();
                }
                // Get the monitoring plan.
                function getMonitoringPlan(plan, facility){
                    // Get variables needed for API Call.
                    var unitStackName = plan[0]
                    var oris = facility["orisCode"]
                    var date;
                    if(plan[1] == "Active"){
                        dt = new Date();
                        date = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
                    }
                    else{
                        yq = plan[2].substr(0,4) + plan[2].substr(8,1);
                        date = makeDateForYYYYQ(yq);
                    }
                    // Make API Call.
                    var monPlanURL = "https://api.data.gov/TEST/epa/FACT/1.0/monitoringPlan/"+oris+"/"+unitStackName+"/"+date+"?api_key="+key;
                    $.ajax({
                        url: monPlanURL,
                        type: "GET",
                        dataType: "json",
                        success: function(res){
                            // Get the data.
                            mp = res["data"]
                            //console.log("here is the plan",mp)
                            // Open the modal.
                            $("#modal").css("display","block")
                            $("#overlay").css("display","block")
                            $("#monPlanPDFLink").html("Download PDF");
                            //$(".fileinfo").html("(6pp, 115K, <a href='/home/pdf-files'>About PDF</a>)")
                            displayReportingFrequencyInfo(mp);
                            displayMonitoringLocationAttributes(mp);
                            displayStackPipesUnitRelationships(mp);
                            displayUnitOperations(mp);
                            displayUnitPrograms(mp);
                            displayUnitFuels(mp);
                            displayUnitControls(mp);
                            displayMonitoringMethods(mp);
                            generateMonitoringSystemTables(mp);
                            displayMonitoringSystem(mp);
                            displaySpanRangeValues(mp);
                            displaySystemFuelFlow(mp);
                            displayAnalyzerRanges(mp);
                            displayEmisssionsFormulas(mp);
                            displayRectangularDuct(mp);
                            displayLoadOperatingInfo(mp);
                            displayMonitoringDefaults(mp);
                            displayQualifications(mp);
                            displayComments(mp);
                            $("#spanValuesTable").css("font-size","small")
                            $("td.dataTables_empty").closest("table").hide();
                            $(".stackRow").closest("tr").css("background-color","lightblue");
                            $(".stackRow").closest("tr").css("font-weight","bolder");
                            $(".modalNav li").css("display", "inline");
                        },
                        error: function(msg){
                            // Display error message.
                        }
                    })
                }
                facilitiesTable.on("click", "tr", function(event){
                    // Get the selected facility"s data.
                    selectedFacility = facilitiesTable.row(this).data();
                    // Highlight the selected row.
                    $(facilitiesTable.rows().nodes()).children().removeClass( "blue" );
                    $(this).children().addClass("blue");
                    // Clear any unit info.
                    clearUnitInfo();
                    //console.log("Clicked this facility: ", selectedFacility);
                    // Load the first tab's page.
                    $("#tabsnav > li:nth-child(1) > a").trigger("click");
                    // Display the data.
                    displayBasicFacilityInfo(selectedFacility);
                    displayContacts(selectedFacility);
                    displayOwners(selectedFacility);
                    displayUnits(selectedFacility);
                    $("#unitsTable > tbody > tr:nth-child(1)").trigger("click");
                    displayMonitoringPlans(selectedFacility);
                });
                $("#facilitiesTable > tbody > tr:nth-child(1)" ).trigger( "click" );
                unitsTable.on("click","tr",function(event){
                    // Get the selected unit's data.
                    var selectedUnit = unitsTable.row(this).data()
                    //console.log("Clicked this unit: ",selectedUnit)
                    // Highlight the selected row.
                    $( unitsTable.rows().nodes() ).children().removeClass( "green" );
                    $(this).children().addClass("green");
                    // Display unit information.
                    displayUnitInfo(selectedFacility,selectedUnit);
                });
                $("#unitsTable > tbody > tr:nth-child(1)").trigger("click");
                monitoringPlansTable.on("click","tr",function(event){
                    // Get the selected unit's data.
                    var selectedPlan = monitoringPlansTable.row(this).data();
                    //console.log("Clicked this monitoring plan: ",selectedPlan)
                    // Highlight the selected row.
                    $( monitoringPlansTable.rows().nodes() ).removeClass( "green" );
                    $(this).addClass("green");
                    getMonitoringPlan(selectedPlan,selectedFacility);
                });
            }
    });
    // Close the modal.
    $(".closeModal").on("click",function(e){
        $("#modal").css("display","none")
        $("#overlay").css("display","none")
    });
    // Main Tabs
    $("#tabs > div").hide(); // hide all child divs
    $("#tabs div:first").show(); // show first child dive
    $("#tabsnav li:first").addClass("active");
    $(".menu-internal").click(function(){
        $("#tabsnav li").removeClass("active");
        var currentTab = $(this).attr("href");
        $("#tabsnav li a[href= ' "+currentTab+" ' ]").parent().addClass("active"); // NOTE: remove the spaces around the quote marks or your code will not work!
        $("#tabs > div").hide();
        console.log(currentTab)
        if(currentTab != "#location"){
            $("#facilityMap").hide();
        }
        else{
            $("#facilityMap").show();
        }
        //facilityMap.invalidateSize();
        $(currentTab).show();
            return false;
    });
    // Create a bookmarkable tab link
    hash = window.location.hash;
    elements = $("a[href= ' "+hash+" ' ]"); // look for tabs that match the hash; NOTE: remove the spaces around the quote marks or your code will not work!
    if (elements.length === 0) { // if there aren't any, then
    $("ul.tabs li:first").addClass("active").show(); // show the first tab
    } else { $("html,body").scrollTop(200); elements.click(); } // else, scroll back to top (if needed) and open the tab in the hash
    // Hide inactive plans and non-operating units.
    // Modal
    $(".modal").css({
        "background-color": "#fff",
        "position": "fixed",
        "top": "50%",
        "left": "50%",
        "transform": "translate(-50%, -50%)",
        "height": "90%",
        "width": "90%",
        "z-index": "1000",
        "display": "none",
        "overflow-y": "scroll",
        "padding": "15px"
    });
    $(".overlay").css({
        "background-color": "rgba(0,0,0,0.6)",
        "position": "fixed",
        "top": "0",
        "left": "0",
        "width": "100%",
        "height": "100%",
        "z-index": "999",
        "display": "none"
    });
    $(".closeModal").css({
        "color": "black",
        "display": "block",
        "text-align": "right",
        "text-decoration": "none"
    });
    // Create toggle for displaying only operating units or all units.
    $("#operatingUnitsToggle").on("change",function(){
        if ($(this).prop("checked")) {
            $("#unitsTable tr td.operatingStatus").each(function(){
                if($(this).html() !== "Operating"){
                    $(this).closest("tr").hide()
                }
                else {
                    $(this).closest("tr").show()
                }
            })
        }
        else {
            $("#unitsTable tr").show();
        }
    });
    // Create toggle for displaying only active plans or all plans.
    $("#activePlansToggle").on("change",function(){
        if ($(this).prop("checked")) {
            $("#monitoringPlansTable tr td.status").each(function(){
                if($(this).html() !== "Active"){
                    $(this).closest("tr").hide();
                }
                else {
                    $(this).closest("tr").show();
                }
            })
        }
        else {
            $("#monitoringPlansTable tr").show();
        }
    });

    $("#monPlanPDFLink").on("click", function(){
        // Default export is a4 paper, portrait, using milimeters for units
        var doc = new jsPDF("l","cm");
        var startY = 1;
        var y;
        var total = 0;
        function newTable(id,str){
            if($("#"+id).is(':hidden')){
                return false
            }
            else{
                var elem = document.getElementById(id);
                var res = doc.autoTableHtmlToJson(elem);
                doc.setFontSize(14);
                doc.text(str, 1.4, y+.7);
                doc.autoTable(res.columns, res.data, {
                    startY: y+1,
                    bodyStyles:{
                        valign:'top'
                    },
                    styles:{
                        overflow:'linebreak',
                        columnWidth:'auto',
                        cellPadding: 0.25
                    },
                    columnStyles: {text: {columnWidth: 'wrap'}}
                });
                y = doc.autoTable.previous.finalY;
                total = total + doc.autoTable.previous.finalY;
                //console.log(id)
            }
        }

        doc.setFontSize(12);
        doc.text("Facility name: "+selectedFacility.name+"\t"+"ORIS: "+selectedFacility.orisCode+"\t"+"Monitoring plan location ID(s): "+mp.unitStackName+"\t"+"State: "+selectedFacility.state.name+"\t"+"County: "+selectedFacility.county.name,1.4,startY);
        y = startY + .5;
        newTable("reportingFrequencyTable","Reporting frequency");
        newTable("monitoringLocationAttributesTable","Monitoring location attributes");
        newTable("stackPipesUnitRelationshipsTable","Stack/pipe and unit relationships");
        newTable("unitOperationsTable","Unit operations");
        newTable("unitProgramsTable","Unit programs");
        newTable("unitControlsTable","Unit controls");
        newTable("monitoringMethodsTable","Monitoring methods");
        doc.setFontSize(14);
        y = y + .5;
        doc.text("Monitoring systems",1.4, y);
        $("table[id^='ms1']").each(function(i){
            newTable("ms1"+i,$("p.ms1"+i).text());
            newTable("ms2"+i,"")
        });
        newTable("spanValuesTable","Span values");
        newTable("systemFuelFlowTable","System fuel flow");
        newTable("analyzerRangesTable","Analyzer range data");
        newTable("emissionsFormulasTable","Emissions formulas");
        newTable("rectangularDuctTable","Rectangular duct wall adjustment factor");
        newTable("loadOperatingInfoTable","Load Operating info");
        newTable("monitoringDefaultsTable","Monitoring defaults");
        newTable("qualificationsTable","Qualification percent");
        newTable("commentsTable","Comments");
        console.log("total: ",total)

        doc.save("monitoring-plan-"+selectedFacility.orisCode+"-"+mp.unitStackName+"-"+mp.beginYearQuarter+".pdf")
    });
});