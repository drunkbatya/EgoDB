window.addEventListener('load', setup, false);

// declaration page objects
var search_btn = document.getElementById("search_btn");
var search_сlear_btn = document.getElementById("search_clear_btn");
var search_list = document.getElementById("search_list");
var id_list = document.getElementById("id_list");
var data_table = document.getElementById("data_table");
var table_edit_btn = document.getElementById("table_edit_btn");
var stop_edit_btn = document.getElementById("stop_edit_btn");
var delete_btn = document.getElementById("delete_btn");
//accessing table elements
var table_elements = [];
table_elements[0] = document.getElementById("comp_name");
table_elements[1] = document.getElementById("comp_inn");
table_elements[2] = document.getElementById("dog_number");
table_elements[3] = document.getElementById("dog_date");
table_elements[4] = document.getElementById("dog_state");
table_elements[5] = document.getElementById("dog_comment");
files_table = document.getElementById("files");

function disableSearchElements(state) {
    search_list.disabled = state;
    search_btn.disabled = state;
    search_clear_btn.disabled = state;
}

function backendGet(url) {
	var req = new XMLHttpRequest();
	return new Promise(function(resolve, reject) {
		req.onload = function() {
	        var resp = JSON.parse(req.responseText);
			resolve(resp);
		}
		req.open('GET', url, true);
		req.send();
	});
}

function backendDel(url) {
	var req = new XMLHttpRequest();
	return new Promise(function(resolve, reject) {
		req.onload = function() {
	        var resp = JSON.parse(req.responseText);
			resolve(resp);
		}
		req.open('DELETE', url, true);
		req.send();
	});
}

function backendPut(url, array) {
	var req = new XMLHttpRequest();
	return new Promise(function(resolve, reject) {
		req.onload = function() {
	        var resp = JSON.parse(req.responseText);
			resolve(resp);
		}
		req.open('PUT', url, true);
        req.setRequestHeader('Content-type','application/json; charset=utf-8');
        var json = JSON.stringify(array);
		req.send(json);
	});
}

function setup(e) {
	//LISTNERS
	search_btn.addEventListener('click', searchGet, false);
	search_clear_btn.addEventListener('click', searchClear, false);
	search_list.addEventListener('click', placeholderChange, false);
	delete_btn.addEventListener('click', deleteData, false);
	search_list.addEventListener('blur', placeholderSet, false);
	//LISTNERS_END
	placeholderSet();
	data_table.style.visibility = 'hidden';
    stop_edit_btn.innerHTML = "Отмена";
    delete_btn.innerHTML = "Удалить запись";
	getList();
    disableSearchElements(false);
}

function searchClear(e) {
	search_list.value = "";
	data_table.style.visibility = 'hidden';
    delete_btn.style.visibility = 'hidden';
    stop_edit_btn.style.visibility = 'hidden';
}

function placeholderSet(e) {
	search_list.placeholder = "Нажми на меня..";
}

function placeholderChange(e) {
	e.target.placeholder = "Можно искать по первым символам..";
	data_table.style.visibility = 'hidden';
    delete_btn.style.visibility = 'hidden';
    stop_edit_btn.style.visibility = 'hidden';
}

function tableClear() {
    for (var i = 0; i < table_elements.length; i++) {
        table_elements[i].innerHTML = "";
    }
    while (files_table.firstChild) {
        files_table.removeChild(files_table.lastChild);
    }
}

async function searchGet(e) {
    tableClear();
    stop_edit_btn.style.visibility = "hidden";
    disableSearchElements(false);
	var search_query = search_list.value;	
	if (!search_query) {
		alert("Введите поисковый запрос!");
		return;
	}
    // getting id from text and ask DB for information by id
    var id = search_query.substr(search_query.indexOf('id=') + 3);
    if (!id) {
        alert("То, что вы ищете, не сущетствует, либо произошел сбой в матрице");
        return;
    }
    var ans = await backendGet('/server/'+id);
    if (ans.length == 0 ) {
        alert("В базе данных отсутствуюет то, что вы ищете");
        return;
    }
    ans = ans[0];
    // updating from DB data
    table_elements[0].innerHTML = ans.comp_name;
    table_elements[1].innerHTML = ans.comp_inn;
    table_elements[2].innerHTML = ans.dog_number;
    table_elements[3].innerHTML = ans.dog_date;
    table_elements[4].innerHTML = ans.dog_state;
    table_elements[5].innerHTML = ans.dog_comment;
    table_edit_btn.removeEventListener('click', editData, false);
    table_edit_btn.innerHTML = "Редактировать";
    table_edit_btn.addEventListener('click', tableEdit, false);
    for (i=0; i < ans.files.length; i++) {
        var link = document.createElement("a");
        var brr = document.createElement("br");
        //var name = ans.files[i].match(/\/(\w+.\w+)$/);
        var name = ans.files[i].match(/\/([^\/]+)$/);
        if (name) {
            // regexp will cut file path to file name; name[1] will print regexp group in ();
            link.innerHTML = name[1];
            link.href = ans.files[i];
            files_table.appendChild(link);
            files_table.appendChild(brr);
        }
    }
    data_table.style.visibility = 'visible';
    delete_btn.style.visibility = "visible";
}

function tableEdit() {
    disableSearchElements(true);
    delete_btn.style.visibility = 'hidden';
    for (var i = 0; i<table_elements.length; i++) {
        var inputElement = document.createElement("input");
        inputElement.type = "text";
        inputElement.className = "data_table_input";
        inputElement.value = table_elements[i].innerHTML;
        table_elements[i].innerHTML = "";
        table_elements[i].appendChild(inputElement);
    }
    table_edit_btn.removeEventListener('click', tableEdit, false);
    table_edit_btn.innerHTML = "Сохранить";
    table_edit_btn.addEventListener('click', editData, false);
    //stop_edit_btn.removeEventListener('click', tableEdit, false);
    stop_edit_btn.innerHTML = "Отмена";
    stop_edit_btn.addEventListener('click', searchGet, false);
    stop_edit_btn.style.visibility = 'visible';
}

async function editData() {
    var search_query = search_list.value;	
    var id = search_query.substr(search_query.indexOf('id=') + 3);
    var array = [];
    for (var i = 0; i<table_elements.length; i++) {
        array[i] = table_elements[i].lastElementChild.value;
    }
    var resp = await backendPut('/server/'+id, array);
    alert(resp);
    searchGet();
}

async function deleteData() {
    var ans = prompt("Бля, ну ты уверен? Если да, то напиши 'ДА'");
    if (ans != "ДА") return;
    var search_query = search_list.value;
    var id = search_query.substr(search_query.indexOf('id=') + 3);
    var resp = await backendDel('/server/'+id);
    alert(resp);
    disableSearchElements(false);
    searchClear();
    getList();
}

async function getList() {
	var resp = await backendGet('/server');
    while (id_list.firstChild) {
        id_list.removeChild(id_list.lastChild);
    }
	for (i=0; i < resp.length; i++) {
		var listElement = document.createElement("option");
		listElement.value = resp[i].comp_name +" -- "+ resp[i].comp_inn + "                   id="+resp[i].id;
		id_list.appendChild(listElement);
	}
}
