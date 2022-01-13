const apikey = '70021134-6bd9-45b7-aae9-65ba64a06bd6';
const apihost = 'https://todo-api.coderslab.pl';



document.addEventListener('DOMContentLoaded', function() {
    apiListTasks()
        .then(tasks => {
            if(tasks.data.length>0){
                for(let i = 0; i < tasks.data.length; i++){
                    renderTask(tasks.data[i].id,tasks.data[i].title,tasks.data[i].description,tasks.data[i].status);
                }
            }
            else{
                console.log("There are no tasks saved");
            }
        })
        .catch((error)=>{
            console.log("Error occured: " + error);
        });
    const body = document.querySelector("body");
    const form = document.querySelector("form");
    console.log(form);
    form.addEventListener("submit", function (event){
        event.preventDefault();
        const title = form.querySelector('#title').value;
        const description = form.querySelector('#description').value;
        apiCreateTask(title,description).then((response)=>{
            renderTask(response.data.id,title,description, response.data.status);
            form.querySelector('#title').value = "";
            form.querySelector('#description').value = "";
        });
    });
});


function apiUpdateTask(taskId, title, description, status){
    return fetch(apihost+"/api/tasks/"+taskId,
        {
            headers:{Authorization:apikey, 'Content-Type':'application/json'},
            body: JSON.stringify({title:title, description:description, status:'closed'}),
            method:'PUT'
        }).then((response)=>{
            if(!response.ok){
                console.log("Error occured");
            }
            return response.json();
    })
}

function apiListTasks(){
   return fetch(apihost + "/api/tasks",{
        headers:  {Authorization : apikey}
    }).then(
       function(resp) {
           if(!resp.ok) {
               alert('Wystąpił błąd! Otwórz devtools i zakładkę Sieć/Network, i poszukaj przyczyny');
           }
           return resp.json();
       }
   );
}

function apiListOperationsForTask(taskId){
    return fetch(
        apihost + '/api/tasks/' + taskId + '/operations',
        { headers: { 'Authorization': apikey } }
    ).then(
        function (resp) { return resp.json(); }
    );
}

function renderTask(taskId, title, description, status){
    const section = document.createElement('section');
    section.className = 'card mt-5 shadow-sm';
    document.querySelector('main').appendChild(section);

    const headerDiv = document.createElement('div');
    headerDiv.className = 'card-header d-flex justify-content-between align-items-center';
    section.appendChild(headerDiv);

    const headerLeftDiv = document.createElement('div');
    headerDiv.appendChild(headerLeftDiv);

    const h5 = document.createElement('h5');
    h5.innerText = title;
    headerLeftDiv.appendChild(h5);

    const h6 = document.createElement('h6');
    h6.className = 'card-subtitle text-muted';
    h6.innerText = description;
    headerLeftDiv.appendChild(h6);

    const headerRightDiv = document.createElement('div');
    headerDiv.appendChild(headerRightDiv);

    if(status == 'open') {
        const finishButton = document.createElement('button');
        finishButton.className = 'btn btn-dark btn-sm js-task-open-only';
        finishButton.innerText = 'Finish';
        headerRightDiv.appendChild(finishButton);
        finishButton.addEventListener("click",function (event){
            apiUpdateTask(taskId,title,description,status).then((response)=>{
                console.log("Task Finished");
                section.removeChild(divForm);
                section.querySelectorAll(".mr-2").forEach((btn)=>{
                    btn.parentElement.removeChild(btn);
                });
                this.parentElement.removeChild(this);
            });
        })

        const divForm = document.createElement("div");
        section.appendChild(divForm);
        divForm.classList.add("card-body");
        const operationForm = document.createElement("form");
        divForm.appendChild(operationForm);
        const divInput = document.createElement("div");
        divInput.classList.add("input-group");
        operationForm.appendChild(divInput);
        const input = document.createElement("input");
        divInput.appendChild(input);
        input.type = "text"; input.placeholder="Operation description"; input.classList.add("form-control"); input.minlength="5";
        const divLast = document.createElement("div");
        divLast.classList.add("input-group-append");
        divInput.appendChild(divLast);
        const buttonSummit = document.createElement("button");
        buttonSummit.classList.add("btn"); buttonSummit.classList.add("btn-info");
        divLast.appendChild(buttonSummit);
        buttonSummit.innerText = "Add";
        divForm.addEventListener("submit", (event)=>{
            event.preventDefault();
            apiCreateOperation(taskId,input.value).then((data)=>{
                renderOperations(operationsUl,input.value,0,data.data.id,"open");
                input.value = null;
            });
        })
    }

    const deleteButton = document.createElement('button');
    deleteButton.className = 'btn btn-outline-danger btn-sm ml-2';
    deleteButton.innerText = 'Delete';
    headerRightDiv.appendChild(deleteButton);
    deleteButton.addEventListener("click",(event)=>{
        apiDeleteTask(taskId).then((el)=>{
            section.parentElement.removeChild(section);
        });
    })

    const operationsUl = document.createElement('ul');
    operationsUl.classList.add("list-group");
    operationsUl.classList.add("list-group-flush");
    section.appendChild(operationsUl);

    apiListOperationsForTask(taskId).then((operations)=>{
        for(let i = 0; i < operations.data.length; i++){
           renderOperations(operationsUl,operations.data[i].description,operations.data[i].timeSpent,operations.data[i].id,status);
        }
    });




}

function apiDeleteOperation(operationId) {
    return fetch(apihost+"/api/operations/"+operationId,
        {
            headers: {Authorization:apikey, 'Content-Type' : 'application/json' },
            method: 'DELETE'
        }).then((response)=>{
            if(!response.ok){
                console.log("Error occured");
            }
            return response.json();
    })
}

function renderOperations(ul,description,timeSpent,id,status){
    const li = document.createElement('li');
    li.classList.add("list-group-item");li.classList.add("d-flex");li.classList.add("justify-content-between");li.classList.add("align-items-center");
    ul.appendChild(li);
    const div1 = document.createElement('div');
    li.appendChild(div1);
    div1.innerText = description;
    const timeSpan = document.createElement('span');
    timeSpan.classList.add("badge"); timeSpan.classList.add("badge-success");timeSpan.classList.add("badge-pill");timeSpan.classList.add("ml-2");
    timeSpan.innerText = renderHours(timeSpent);
    div1.appendChild(timeSpan);
    const div2 = document.createElement('div');
    li.appendChild(div2);
    console.log(status);
   if(status =="open"){
       const button15 = document.createElement('button');
        button15.classList.add("btn");button15.classList.add("btn-outline-success");button15.classList.add("btn-sm");button15.classList.add("mr-2");
        button15.id = "button15min";
        button15.innerText = "+15m";
        div2.appendChild(button15);
        const button1h = document.createElement('button');
        button1h.classList.add("btn");button1h.classList.add("btn-outline-success");button1h.classList.add("btn-sm");button1h.classList.add("mr-2");
        button1h.id = "button1h";
        button1h.innerText = "+1h";
        div2.appendChild(button1h);
        button1h.addEventListener("click",(event)=>{
            apiUpdateOperation(id, description, timeSpent+60).then((response)=>{
                console.log(response);
                timeSpan.innerText = renderHours(response.data.timeSpent);
                timeSpent = response.data.timeSpent;
            });
        });
        button15.addEventListener("click",(event)=>{
            apiUpdateOperation(id, description, timeSpent+15).then((response)=>{
                console.log(response);
                timeSpan.innerText = renderHours(response.data.timeSpent);
                timeSpent = response.data.timeSpent;
            });
        });
   }
    const buttonDelete = document.createElement('button');
    buttonDelete.classList.add("btn");buttonDelete.classList.add("btn-outline-danger");buttonDelete.classList.add("btn-sm");
    buttonDelete.innerText = "Delete";
    div2.appendChild(buttonDelete);

    buttonDelete.addEventListener("click",function (event){
        apiDeleteOperation(id).then((data)=>{
            this.parentElement.parentElement.parentElement.removeChild(li);
        })
    })

}

function renderHours(total){
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    if(hours > 0) {
        return hours + ' h ' + minutes + ' min';
    } else {
        return minutes + ' min';
    }
}

function apiCreateTask(title, description) {
    return fetch(apihost + "/api/tasks", {
        headers: {'Authorization': apikey, 'Content-Type': 'application/json'},
        body: JSON.stringify({title: title, description: description, status: 'open'}),
        method: 'POST'
    })
        .then((response) => {
            if (!response.ok) {
                console.log("Eroor occured");
            }
            return response.json();
        })
}

function apiDeleteTask(taskId){
    return fetch(apihost +"/api/tasks/"+taskId,{
        headers: { 'Authorization' : apikey },
        method: 'DELETE'
    }).then((response) => {
        if(!response.ok){
            console.log("Error occured");
        }else
            return response.json();
    })
}

function apiCreateOperation(taskId, description){
    return fetch(apihost+'/api/tasks/'+taskId+'/operations',
        {
           headers: {Authorization:apikey, 'Content-Type' : 'application/json'},
            body: JSON.stringify({description:description, timeSpent: 0}),
            method : 'POST'
        }).then((response)=>{
            if(!response.ok){
                console.log("Error occured");
            }
            return response.json();
    })
}

function apiUpdateOperation(operationId, description, timeSpent){
    return fetch(apihost + '/api/operations/'+operationId,
        {
            headers: {Authorization:apikey, 'Content-Type':'application/json'},
            body: JSON.stringify({description:description, timeSpent:timeSpent}),
            method: 'PUT'
        }).then((response) => {
            if(!response.ok){
                console.log("Error occured");
            }
            return response.json();
    })
}