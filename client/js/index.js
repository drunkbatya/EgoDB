// declaration page objects
var search_btn = document.getElementById("search_btn");
var search_сlear_btn = document.getElementById("search_clear_btn");
var search_list = document.getElementById("search_list");
var id_list = document.getElementById("id_list");
var data_table = document.getElementById("data_table");
var table_edit_btn = document.getElementById("table_edit_btn");
var stop_edit_btn = document.getElementById("stop_edit_btn");
var delete_btn = document.getElementById("delete_btn");
var add_btn = document.getElementById("add_btn");
var server_error_msg = document.getElementById("server_error_cont");
var loading = document.getElementById("loading_cont");
var egouser_name = document.getElementById("egouser_name");
//accessing table elements
var table_elements = {};
table_elements.comp_name = document.getElementById("comp_name");
table_elements.comp_inn = document.getElementById("comp_inn");
table_elements.comp_ogrn = document.getElementById("comp_ogrn");
table_elements.comp_kpp = document.getElementById("comp_kpp");
table_elements.dog_number = document.getElementById("dog_number");
table_elements.dog_date = document.getElementById("dog_date");
table_elements.dog_state = document.getElementById("dog_state");
table_elements.comp_addr = document.getElementById("comp_addr");
table_elements.dog_comment = document.getElementById("dog_comment");
files_table = document.getElementById("files");

window.addEventListener('load', setup, false);

function disableSearchElements(state) {
    search_list.disabled = state;
    search_btn.disabled = state;
    search_clear_btn.disabled = state;
}

function checkServer() {
    var req = new XMLHttpRequest();
    req.timeout = 1000; // 1s
    req.onload = function() {
        if (req.status == 200 && req.responseText == "OK") {
            server_error_msg.style.display = "none";
        }
        else {
            loading.style.display = "none";
            server_error_msg.style.display = "block";
        }
    }
    req.ontimeout = function() {
        loading.style.display = "none";
        server_error_msg.style.display = "block";
    }
    req.onerror = function() {
        loading.style.display = "none";
        server_error_msg.style.display = "block";
    }
    req.open('GET', '/check', true);
    req.send();
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
            loading.style.display = "none";
	        var resp = JSON.parse(req.responseText);
			resolve(resp);
		}
		req.open('DELETE', url, true);
		req.send();
	});
}

function backendPut(url, array) {
	var req = new XMLHttpRequest();
    loading.style.display = "block";
	return new Promise(function(resolve, reject) {
		req.onload = function() {
            loading.style.display = "none";
	        var resp = JSON.parse(req.responseText);
			resolve(resp);
		}
		req.open('PUT', url, true);
        req.setRequestHeader('Content-type','application/json; charset=utf-8');
        var json = JSON.stringify(array);
		req.send(json);
	});
}

function backendPost(url, array) {
    //console.log(array);
	var req = new XMLHttpRequest();
    loading.style.display = "block";
	return new Promise(function(resolve, reject) {
		req.onload = function() {
	        loading.style.display = "none";
            var resp = JSON.parse(req.responseText);
			resolve(resp);
		}
		req.open('POST', url, true);
        req.setRequestHeader('Content-type','application/json; charset=utf-8');
        var json = JSON.stringify(array);
		req.send(json);
	});
}

function backendUploadFiles(url, files) {
	var req = new XMLHttpRequest();
    var formData = new FormData();
    loading.style.display = "block";
	return new Promise(function(resolve, reject) {
		req.onload = function() {
	        var resp = JSON.parse(req.responseText);
            loading.style.display = "none";
			resolve(resp);
		}
        for(var i =0; i<files.length; i++) {
            formData.append('docs', files[i], files[i].name);
        }
        req.open('POST', url);
		req.send(formData);
	});
}


function setup(e) {
	//LISTNERS
	search_btn.addEventListener('click', searchGet, false);
	search_clear_btn.addEventListener('click', searchClear, false);
	search_list.addEventListener('click', placeholderChange, false);
	delete_btn.addEventListener('click', deleteData, false);
	search_list.addEventListener('blur', placeholderSet, false);
	add_btn.addEventListener('click', tableAddData, false);
	logout_btn.addEventListener('click', logout, false);
	//LISTNERS_END
	placeholderSet();
    getEgoUserName();
	data_table.style.visibility = 'hidden';
    stop_edit_btn.innerHTML = "Отмена";
    delete_btn.innerHTML = "Удалить документ";
	getList();
    disableSearchElements(false);
    loading.style.display = "none";
    server_error_msg.style.display = "none";
    setInterval(checkServer, 3000);

}

function searchClear(e) {
	search_list.value = "";
	data_table.style.visibility = 'hidden';
    delete_btn.style.visibility = 'hidden';
    stop_edit_btn.style.visibility = 'hidden';
    disableSearchElements(false);
    add_btn.disabled=false;
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
    for (var cur in table_elements) {
        table_elements[cur].innerHTML = "";
    }
    while (files_table.firstChild) {
        files_table.removeChild(files_table.lastChild);
    }
}

function convertDate(inp) {
    inp = inp.split("-");
    inp = inp[2]+"-"+inp[1]+"-"+inp[0];
    return inp;
}

function removeFileButton(e) {
    e.remove();
}

// this function will check does array contains only null values
// we need this function because "array.length" will be true 
// even if array contains everything, e.g. null values
function checkFullNulledArray(array) {
    for (var cur in array) {
        if (array[cur] != null) { 
            return false;
        }
    }
    return true;
}

async function searchGet(e) {
    tableClear();
    stop_edit_btn.style.visibility = "hidden";
	var search_query = search_list.value;	
	if (!search_query) {
		alert("Введите поисковый запрос!");
		return;
	}
    // getting id from text and ask DB for information by id
    if (!search_query.includes("id=") || search_query.split("id=").length != 2 || !search_query.split("id=")[1]) {
        alert("Указан неверный поисковый запрос! Следует использовать элементы из выпадающего списка");
        return;
    }
    var id = search_query.split("id=")[1];
    if (!id) {
        alert("То, что вы ищете, не сущетствует, либо произошел сбой в матрице");
        return;
    }
    var ans = await backendGet('/server/'+id);
    if (ans.length == 0 ) {
        alert("В базе данных отсутствуюет то, что вы ищете");
        return;
    }
    disableSearchElements(false);
    add_btn.disabled=true;
    ans = ans[0];
    // converting date from "2021-01-04T00:00:00.000Z" to "2021-01-04"
    if (ans.dog_date) {
        ans.dog_date = ans.dog_date.match(/\d{4}-\d{2}-\d{2}/g);
        ans.dog_date = convertDate(ans.dog_date[0]);
    }
    // updating from DB data
    for (var cur in ans) {
        if (cur == "files" || cur == "id") continue;
        table_elements[cur].innerHTML = ans[cur];
    }
    //
    removeAllEventListeners();
    table_edit_btn.innerHTML = "Редактировать";
    table_edit_btn.addEventListener('click', tableEdit, false);
    if (ans.files) {
        for (i=0; i < ans.files.length; i++) {
            var link = document.createElement("a");
            var brr = document.createElement("br");
            link.innerHTML = ans.files[i];
            link.href = "/files/"+id+"/"+encodeURIComponent(ans.files[i]);
            link.target = "_blank";
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
    convertTableTextToInput();
    removeAllEventListeners();
    table_edit_btn.innerHTML = "Сохранить";
    table_edit_btn.addEventListener('click', editData, false);
    stop_edit_btn.innerHTML = "Отмена";
    stop_edit_btn.addEventListener('click', searchGet, false);
    stop_edit_btn.style.visibility = 'visible';
}

function convertTableTextToInput() {
    for (var cur in table_elements) {
        var inputElement = document.createElement("input");
        if (table_elements[cur].id == "dog_date") {
            inputElement.type = "date";
            inputElement.required = true;
            inputElement.value = convertDate(table_elements[cur].innerHTML);
        }
        else {
            inputElement.type = "text";
            inputElement.className = "data_table_input";
            inputElement.value = table_elements[cur].innerHTML;
        }
        table_elements[cur].innerHTML = "";
        table_elements[cur].appendChild(inputElement);
    }
    // files
    var files_array = [];
    // pushing all existing file names to array
    for (var i=0; i<files_table.childNodes.length; i++) {
        if (files_table.childNodes[i].innerHTML) {
            files_array.push(files_table.childNodes[i].innerHTML);
        }
    }
    // clearing file table
    while (files_table.firstChild) {
        files_table.removeChild(files_table.lastChild);
    }

    for (var i=0; i<files_array.length; i++) {
        var file_button = document.createElement("button");
        var brr = document.createElement("br");
        file_button.innerHTML = "Удалить "+files_array[i];
        file_button.className = "remove_file";
        file_button.onclick = function() {
            removeFileButton(this);
        }
        files_table.appendChild(file_button);
        files_table.appendChild(brr);
    }
    
    var file_input = document.createElement("input");
    file_input.type = "file";
    file_input.multiple = true;
    file_input.id = "file_uploader";
    files_table.appendChild(file_input);
}

async function editData() {
    var file_uploader = document.getElementById("file_uploader");
    var search_query = search_list.value;	
    var id = search_query.substr(search_query.indexOf('id=') + 3);
    var obj = {
        data: {},
        files: []
    };
    var resp;
    for (var cur in table_elements) {
        if (table_elements[cur].lastElementChild.value) {
            obj.data[cur] = table_elements[cur].lastElementChild.value;
        }   
        else {
            obj.data[cur] = null;
        }
    }
    if (checkFullNulledArray(obj.data)) {
        alert("Введите хоть что-нибудь!");
        return;
    }
    // getting list of existing files
    for (var i=0; i<files_table.childNodes.length; i++) {
        if (files_table.childNodes[i].innerHTML) {
            var innerOnButton = files_table.childNodes[i].innerHTML;
            var fileName = innerOnButton.substr(innerOnButton.indexOf('Удалить ') + 8);
            obj.files.push(fileName);
        }
    }

    resp = await backendPut('/server/'+id, obj);
    if (file_uploader.files.length && resp.text == "Операция выполнена успешно!") {
        resp = await backendUploadFiles('/server/files/'+id, file_uploader.files);
        alert(resp.text);
    }
    else {
        alert(resp.text);
    }
    getList();
    searchGet();
}

async function deleteData() {
    var ans = prompt("Вы уверены? Если да, то напишите 'ДА'");
    if (ans != "ДА") return;
    var search_query = search_list.value;
    var id = search_query.substr(search_query.indexOf('id=') + 3);
    var resp = await backendDel('/server/'+id);
    alert(resp.text);
    disableSearchElements(false);
    searchClear();
    getList();
}

function tableAddData() {
    search_list.value = "";
    removeAllEventListeners();
    disableSearchElements(true);
    add_btn.disabled=true;
    delete_btn.style.visibility = 'hidden';
    data_table.style.visibility = 'visible';
    table_edit_btn.innerHTML = "Сохранить";
    table_edit_btn.addEventListener('click', addData, false);
    stop_edit_btn.innerHTML = "Отмена";
    stop_edit_btn.addEventListener('click', searchClear, false);
    stop_edit_btn.style.visibility = 'visible';
    tableClear();
    convertTableTextToInput();

}
async function addData() {
    // in first, we writing all text data to db, and uploading files after success
    var array = {};
    var file_uploader = document.getElementById("file_uploader");
    for (var cur in table_elements) {
        if (table_elements[cur].lastElementChild.value) {
            array[cur] = table_elements[cur].lastElementChild.value;
        }
        else {
            array[cur] = null;
        }
    }
    if (checkFullNulledArray(array)) {
        alert("Введите хоть что-нибудь!");
        return;
    }
    var resp = await backendPost('/server', array);
    if (file_uploader.files.length && resp.text == "Операция выполнена успешно!") {
        var resp = await backendUploadFiles('/server/files/'+resp.id, file_uploader.files);
        alert(resp.text);
    }
    else {
        alert(resp.text);
    }
    searchClear();
    getList();
}
function removeAllEventListeners() {
    //[ENG] Fuck.. in JS, i can't remove all event listeners.. 
    //[RUS] Да.. Ебать его рот.. Втянули меня в какую-то хуйню..
    stop_edit_btn.removeEventListener('click', searchGet, false);
    table_edit_btn.removeEventListener('click', addData, false);
    table_edit_btn.removeEventListener('click', editData, false);
    table_edit_btn.removeEventListener('click', tableEdit, false);
    stop_edit_btn.removeEventListener('click', searchClear, false);
}
async function getList() {
	var resp = await backendGet('/server');
    while (id_list.firstChild) {
        id_list.removeChild(id_list.lastChild);
    }
	for (i=0; i < resp.length; i++) {
		var listElement = document.createElement("option");
		listElement.value = resp[i].comp_name +" -- "+ resp[i].comp_inn +" -- "+ resp[i].comp_ogrn +" -- "+ resp[i].dog_number+"  id="+resp[i].id;
		id_list.appendChild(listElement);
	}
}
async function getEgoUserName() {
    var resp = await backendGet('/server/username');
    egouser_name.innerHTML = resp.egouser_name;
}
function logout() {
    backendDel('/server/logout');
    window.location.href = "/login";
}
