var nextId;
  function updateNextId(){
    $.get(lastPage, function(values,status){
      nextId = values._embedded.employees[countProps(values._embedded.employees)-1].id + 1;
    });
  }
  
  //rubato da stackoverflow
  function countProps(obj) {
    var count = 0;
    for (var p in obj) {
      obj.hasOwnProperty(p) && count++;
    }
    return count; 
  }
  
  function updateEmployees() {
      var rows = "";
  
      var css_class = "dim-background";
      var cls = "";
      var counter = 0;
  
      $.each(data, function (key, value) {
        if(counter % 2 == 0){
          cls = css_class;
        }
        counter++;
        rows += "<tr class='"+ cls +"' id='row-"+ value.id +"'>";
  
        //id
        rows += "<td>" + value.id + "</td>";
  
        //nome
        rows += "<td><span id='name-"+ value.id+"'>" + value.firstName + "</span><input type='text' class='display-none' id='input-name-"+ value.id+"'  placeholder='"+value.firstName+"'></td>";
        
        //cognome
        rows += "<td><span id='lastname-"+ value.id+"'>" + value.lastName + "</span><input type='text' class='display-none' id='input-lastname-"+ value.id+"' placeholder='"+value.lastName+"'></td>";
  
        //azione
        rows += "<td>" + "<button class='change-button' id='change-"+value.id+"' onclick='change(" + value.id + ")'>Cambia</button>" + 
                        "<button class='delete-button' id='" + value.id + "' onclick='removeEmployee(" + value.id + ")'>Cancella</button>"
              "</td>"; //invece che usare l'onclick etc si poteva usare data-id (funzionalità di jquery che ci permette di cliccare e eseguire)
        rows += "</tr>";
        cls = "";
      });
      $("#to-fill").html(rows);
  }
  
  function change(id){
    $("#name-"+id).addClass("display-none");
    $("#input-name-"+id).removeClass("display-none");
  
    $("#lastname-"+id).addClass("display-none");
    $("#input-lastname-"+id).removeClass("display-none");
  
    $("#change-"+id).removeClass("change-button");
    $("#change-"+id).addClass("save-button");
    $("#change-"+id).text("Salva");
    $("#change-"+id).attr("onclick", "save("+id+")");
  }
  
  function save(id){
    //visibilità varie
    $("#name-"+id).removeClass("display-none");
    $("#input-name-"+id).addClass("display-none");
  
    $("#lastname-"+id).removeClass("display-none");
    $("#input-lastname-"+id).addClass("display-none");
  
    $("#change-"+id).removeClass("save-button");
    $("#change-"+id).addClass("change-button");
    $("#change-"+id).text("Cambia");
    $("#change-"+id).attr("onclick", "change("+id+")");
  
    let newName = $("#input-name-"+id).val();
    let newLastname = $("#input-lastname-"+id).val();
  
    //cambiamenti
    if(newName == ""){
      newName = $("#name-"+id).text();
    }
  
    if(newLastname == ""){
      newLastname = $("#lastname-"+id).text();
    }
  
    $("#name-"+id).text(newName);
    $("#lastname-"+id).text(newLastname);
    changeNames(newName, newLastname, id);
  
    $("#input-name-"+id).attr("placeholder", newName);
    $("#input-lastname-"+id).attr("placeholder", newLastname);
  
    $("#input-name-"+id).val("");
    $("#input-lastname-"+id).val("");
  
    let payload = {
      firstName: newName,
      id: id,
      lastName: newLastname,
      birthDate: "",
      hireDate: "",
      gender: ""
    };
    console.log(id);
    saveChanges(payload);
  }
  
  function saveChanges(payload){
    $.ajax({
      method: "PUT",
      url: "http://localhost:8080/script.js",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(payload)
    });
  }
  
  function changeNames(name, lastname, id){
    $.each(data, function(key,value){
      if(value.id == id){
        value.firstName = name;
        value.lastName = lastname;
      }
    });
  }
  
  function removeEmployee(id){
    $.ajax({
      url: firstPage + "/" + id,
      type: 'DELETE',
      success: function(result) {
          removeFromTable(id);
      }
    });
  }
  
  function removeFromTable(id){
    $.each(data, function(key, value){
      if(value.id == id){
        data.splice(key, 1);
        $("#" + id).closest("tr").remove();
        recolorRows();
        return;
      }
    });
  }
  
  function recolorRows(){
    $.each(data, function(key, value){
      if(key % 2 == 0){
        $("#row-"+value.id).addClass("dim-background");
      }else{
        $("#row-"+value.id).removeClass("dim-background");
      }
    });
  }
  
  function addEmployee(name, lastname, birth, hiredate, gender){
    let payload = ({
      "id": nextId,
      "birthDate": birth,
      "firstName": name,
      "lastName": lastname,
      "gender": gender,
      "hireDate": hiredate,
    });
    saveEmployee(payload);
    updateEmployees();
  
    nextId++;
  }
  
  function saveEmployee(payload){
    $.ajax({
      method: "POST",
      url: "http://localhost:8080/script.js",
      dataType: "json",
      contentType: "application/json",
      data: JSON.stringify(payload)
    });
  }
  
  function saveModalInputs(){
    addEmployee(
      $("#name").val().trim(),
      $("#lastname").val().trim(),
      $("#birthday").val(),
      $("#hiring-date").val(),
      $("#sex").val()
    );
    updateEmployees();
  }
  
  var nextPage;
  var previousPage;
  var lastPage;
  var selfPage;
  var firstPage = "http://localhost:8080/script.js";
  
  function loadFirstPage(){
    $.get(firstPage, function(values,status){
  
      lastPage = values._links.last.href;
      nextPage = values._links.next.href;
      selfPage = firstPage;
      previousPage = selfPage;
  
      data = values._embedded.employees;
      updatePageNumber(values.page.number);
      updateEmployees();
  
      updateNextId();
    });
  }
  
  function loadLastPage(){
    $.get(lastPage, function(values,status){
  
      nextPage = "";
      previousPage = values._links.prev.href;
      selfPage = lastPage;
  
      data = values._embedded.employees;
      updatePageNumber(values.page.number);
      updateEmployees();
    });
  }
  
  function loadNextPage(){
    $.get(nextPage, function(values,status){
  
      previousPage = selfPage;
      selfPage = nextPage;
      nextPage = values._links.next.href;    
  
      data = values._embedded.employees;
      updatePageNumber(values.page.number);
      updateEmployees();
    });
  }
  
  function loadPreviousPage(){
    $.get(previousPage, function(values,status){
  
      nextPage = values._links.next.href;
      selfPage = previousPage;
  
      previousPage = values._links.prev.href;
  
      data = values._embedded.employees;
      updatePageNumber(values.page.number);
      updateEmployees();
    });
  }
  
  function updatePageNumber(number){
    $("#page-counter").text(number+1);
  }
  
  var data;
  
  $( window ).on( "load", function() {
    loadFirstPage();
  })
  
  function emptyModalInputs(){
    $("#name").val("");
    $("#lastname").val("");
    $("#birthday").val("");
    $("#hiring-date").val("");
  } 