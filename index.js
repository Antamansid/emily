//На главной станице сначала появляется приветствие
//Типа: Добро пожаловать!
//И кнопка "создать проект"
//Когда эту кнопку нажимают срабатывает эта функция
function showPanelForMakingNewProject(){
  //поиск элемента-родителя куда форму вставлять
  let element = document.getElementById('meetings');
  //Очищаем форму
  element.innerText = "";
  //Создаем инпут для имени проекта
  let inputNameProject = document.createElement('input');
  //Создаем кнопку создать
  let buttonSendDataToServer = document.createElement('input');
  buttonSendDataToServer.type="button";
  buttonSendDataToServer.value = "Создать проект";
  //К инпуту добавляем плейсхолдер
  inputNameProject.placeholder = 'Введите название проекта';
  //создаем форму - контент для кнопки с инпутом
  //делается для того, чтобы срабатывало при нажатии ентер - удобно!
  let formForCreating = document.createElement('form');
  //прикрепляем кнопку и инпут
  formForCreating.appendChild(inputNameProject);
  formForCreating.appendChild(buttonSendDataToServer);
  //Присобачим стили
  //Собачим здесь, чтобы не шуршить в стили
  formForCreating.style.display="flex";
  formForCreating.style.flexDirection = "column";
  formForCreating.style.justifyContent = "center";
  formForCreating.style.alignItems = "center";
  //При нажатии ентер происходит событие onsubmit
  formForCreating.onsubmit = ()=>{
    createProject(inputNameProject.value, ()=>{
      showWorkPlace(inputNameProject.value); 
      addWorkPlace()
    });
    //Самое главное вернуть falsr
    //Чтобы форма не отправила на сервер данные
    //Хотя тут ничего не указана про сервер
    return false;
  };
  //Добавляем форму на сайт
  element.appendChild(formForCreating);
  //Текст кнопки
  //buttonSendDataToServer.textContent = 'Создать проект';
  //Добавляем обработчик событий на нажатие кнопки
  buttonSendDataToServer.addEventListener('click', ()=>{
    createProject(inputNameProject.value, ()=>{
      showWorkPlace(inputNameProject.value); 
      addWorkPlace();
      showEditeFrame()
    });
  });

  //Сообщение об ошибке  
  //Создаем форму
  let divError = document.createElement('div');
  divError.id = "errorMsg";

  let erroText = document.createElement('p');
  let errorBtn = document.createElement('button');
  //Чтобы на кнопке было надпись ОК
  errorBtn.textContent = "OK";
  //Подмандякаем текст посередине
  erroText.style.margin = "auto";

  //Добавляем на форму элеенты
  divError.appendChild(erroText);
  divError.appendChild(errorBtn);

  divError.setAttribute('style', 'width: 200px; height: 100px; position: absolute; border: 2px solid grey; border-radius: 5px; z-index: 99; background-color: white; display: none; left: 30%; top: 30%;');

  errorBtn.addEventListener('click', ()=>{
    divError.style.display = "none";
  });
  document.body.appendChild(divError);
  $(divError).draggable();

  //Панель добавления зависимостей  
  //Поиск куда добавляем панель плагинов
  //На момент подгрузки 
  //Можно тоже запихать в форму, но лучше пускай пользователь проверит все перед тем как запускать триггер

  //Создаем форму
  let divAddingDependencies = document.createElement('div');
  //устанавливаем айди для формы добавления зависимостей, чтобы 
  //делать проверку заполнили ли все поля
  divAddingDependencies.id = "divAddingDependencies";

  let namePanelDependencies = document.createElement('p');
  let variableDependencies = document.createElement('input');
  let inputDependencies = document.createElement('input');
  let buttonAddingDependencies = document.createElement('button');
  let buttonCloseDependencies = document.createElement('button');

  //Добавляем на форму элеенты
  divAddingDependencies.appendChild(namePanelDependencies);
  divAddingDependencies.appendChild(variableDependencies);
  divAddingDependencies.appendChild(inputDependencies);
  divAddingDependencies.appendChild(buttonAddingDependencies);
  divAddingDependencies.appendChild(buttonCloseDependencies);

  //Добалвяем надписи
  variableDependencies.placeholder = 'Название зависимости в проекте';
  inputDependencies.placeholder = 'Название зависимости в npm';
  namePanelDependencies.textContent = 'Добавление зависимостей';
  buttonAddingDependencies.textContent = 'Добавить в проект';
  buttonCloseDependencies.textContent = 'Закрыть';

  //Добавляем стили
  divAddingDependencies.setAttribute('style', 'width: 200px; height: 250px; position: absolute; border: 2px solid grey; border-radius: 5px; z-index: 99; background-color: white; display: none; left: 30%; top: 30%;');
  namePanelDependencies.setAttribute('style', 'margin: auto');
  //Добавляем обработчик нажатия кнопки
  buttonAddingDependencies.addEventListener('click', ()=>{addDependency(inputDependencies.value, document.getElementById('nameProject').innerText, variableDependencies.value, (response)=>{
    //Если удалось добавить зависимость
    //Создаем ее панель    
    let divDependencies = document.getElementById('plugins').childNodes[2];
    let newDependency = document.createElement('div');
    let newDependencyCode = document.createElement('p');
    //на странице просто показываем, что зависимость объявлена и ею можно пользоваться
    newDependencyCode.textContent += `let ${variableDependencies.value} = '${inputDependencies.value}';`;
    //Добавляем все на форму
    newDependency.appendChild(newDependencyCode);
    divDependencies.appendChild(newDependency);
    //Самое интересное
    //Импортируем скрипт на страницу
    //С сервера к нам пришел код зависимости в джейсоне
    //Аксиосом он уже распарсен
    //Просто объявляем его
    let modules = response.data;
    //Создаем ДОМ элемент скрипта
    let moduleScript = document.createElement('script');
    //Атрибут defer откладывает выполнение скрипта до тех пор, пока вся страница не будет загружена полностью.
    moduleScript.defer = true;
    //Объявлем переменные
    //С сервера на сайт приходит сбаблинный скрипт зависимости
    //Она представляет собой обертку с функцией require('зависимость')
    //и самой зависимости
    //По этому, мы сначала создаем "вызыватель" зависимости
    //А потом саму зависимость
    //К примеру скачиваем реакт
    //Пишем название в проекте - React, название зависимости в npm react
    //Сервер компилит и отдает на сайт отбабленную функцию require(), в теле которой есть реакт
    //Делаем переменную Reactreq = require();
    //А потом делаем React = Reactreq(react);
    //За доп инфой обращайтесь в broserify
    moduleScript.text = `let ${variableDependencies.value}req = ${modules}; let ${variableDependencies.value} = ${variableDependencies.value}req('${inputDependencies.value}');`;
    //Добалвяем на страницу зависимость
    document.body.appendChild(moduleScript);
    //Говорим пользователю, что добавлена
    //ПЕРЕДЕЛАТЬ!
    moduleScript.addEventListener('load', console.log('added'))
    //Обнуляем значения форма
    variableDependencies.value = "";
    inputDependencies.value = "";
  })});
  buttonCloseDependencies.addEventListener('click', ()=>{
    //Обнуляем значения форма
    namePanelDependencies.textContent = 'Добавление зависимостей';
    variableDependencies.value = "";
    inputDependencies.value = "";
    //делаем стандартным цвета полей, если они были расскрашены
    //Получаем массив детей на форме добавления зависимостей
    let formDependency = document.getElementById("divAddingDependencies").children;
    document.getElementById("divAddingDependencies").style.borderColor = "grey";
    let nameDependencyInput = formDependency[2];
    let variableDependencyInput = formDependency[1];
    variableDependencyInput.style.borderColor = "";
    nameDependencyInput.style.borderColor = "";
    //Убираем саму форму
    divAddingDependencies.style.display = "none";
  });
  document.body.appendChild(divAddingDependencies);
  $(divAddingDependencies).draggable();
}

//Функция показа рабочей области
function showWorkPlace(nameProject){
  //Добавление название панелей и подокон
  //Для плагинов
  let pPlagins = document.createElement('p');
  pPlagins.innerText = "Плагины/Дополнения";
  pPlagins.classList.add("namePanel");
  let vPlagins = document.createElement('div');
  document.getElementById('plugins').appendChild(pPlagins);
  document.getElementById('plugins').appendChild(vPlagins);
  document.getElementById('plugins').classList.add('panels');
  vPlagins.classList.add('panels');
  //Для обзора
  let pOverview = document.createElement('p');
  pOverview.innerText = "Обзор";
  pOverview.classList.add('namePanel');
  let vOverview = document.createElement('div');
  document.getElementById('overview').appendChild(pOverview);
  document.getElementById('overview').appendChild(vOverview);
  document.getElementById('overview').classList.add('panels');
  vOverview.classList.add('panels');
  //Для цепочки
  let pNeighborhood = document.createElement('p');
  pNeighborhood.innerText = "Последовательность";
  pNeighborhood.classList.add('namePanel');
  let vNeighborhood = document.createElement('div');
  document.getElementById('neighborhood').appendChild(pNeighborhood);
  document.getElementById('neighborhood').appendChild(vNeighborhood);
  document.getElementById('neighborhood').classList.add('panels');
  vNeighborhood.classList.add('panels');
  //Для ТЗ
  let pTz = document.createElement('p');
  pTz.innerText = "Тех задание";
  pTz.classList.add('namePanel');
  let vTz = document.createElement('div');
  document.getElementById('tz').appendChild(pTz);
  document.getElementById('tz').appendChild(vTz);
  document.getElementById('tz').classList.add('panels');
  vTz.classList.add('panels');
  //Для панели инструментов
  let pPanelItems = document.createElement('p');
  pPanelItems.innerText = "Инструменты";
  pPanelItems.classList.add('namePanel');
  let vPanelItems = document.createElement('div');
  document.getElementById('panelItems').appendChild(pPanelItems);
  document.getElementById('panelItems').appendChild(vPanelItems);
  document.getElementById('panelItems').classList.add('panels');
  vPanelItems.classList.add('panels');
  //Для панели редактирвоания
  let codeIframe = document.createElement('div');
  codeIframe.classList.add('codeIframe');
  codeIframe.id = "codeIframe";
  document.getElementById('columnWork').appendChild(codeIframe);
  //В навигацию добавим название проекта
  let nameProj = document.createElement('p');
  nameProj.innerText = nameProject;
  nameProj.classList.add('namePanel');
  nameProj.id = "nameProject";
  document.getElementById('navigationMenu').appendChild(nameProj);
}
//ШО ЗА НАХ и зачем оно?
function addDepend(){
  console.log('addDependWork');
  document.getElementById('divAddingDependencies').style.display = "inherit";
}

//Добавляем Рабочу область на страницу
function addWorkPlace(){
  //Создаем ДИВ куда будем пихать диаграму
  let divMyDiagram = document.createElement('div');
  //Задаем ей айди, годжс требует
  divMyDiagram.id = 'myDiagramDiv';
  //задаем стили
  divMyDiagram.setAttribute('style', 'width:100%; height:100%; border: 2px solid grey; border-radius: 5px');
  //ищем элемент куда пихать див
  let element = document.getElementById('diagram');
  //очищаем его от приветствий
  document.getElementById('diagram').innerText = "";
  //пихаем туда диаграмму
  element.appendChild(divMyDiagram);
  //по загрузке таблицы инициируем рисование годжс рабочего места
  element.onload = init();
}

//Показывает текстареа, с помощью которого можно добавить код в блок
function showEditeFrame(){
  let parrent = document.getElementById('codeIframe');

  let textAreaEditor = document.createElement('textarea');
  let buttonSave = document.createElement('button');
  let buttonAddFunc = document.createElement('button');
  
  textAreaEditor.id = 'funcText';
  buttonSave.id = 'SaveButton';
  buttonAddFunc.id = 'addFunc';

  buttonSave.textContent = 'Save';
  buttonAddFunc.textContent = 'Add Function';

  parrent.appendChild(textAreaEditor);
  parrent.appendChild(buttonSave);
  parrent.appendChild(buttonAddFunc);
  
  buttonSave.addEventListener('click', ()=>{save()});
  buttonAddFunc.addEventListener('click', ()=>{addFunc.call(addFunc)});
  
}

//функция создания проект
//Срабатывает при нажатии кнопки "creat project"
function createProject(nameProject, callback){
  //Если имя не введено
  if(!nameProject){
    let errorMsg = document.getElementById("errorMsg");
    errorMsg.style.display = "inherit";
    errorMsg.children[0].innerHTML = "Введите название проекта";
  } else {
    //Аксиосом пости на сервер создание нового проекта
    axios({
      method:'post',
      url:'http://localhost/newProject',
      data: {name: nameProject}
    }).then(()=>{
      //Если все ок, передаем в колбэк респонс
      callback();
    })
  }
}
//функция добавления зависимости в проект
//принимает имя зависимости, имя проекта (на сервере создается дирректория с именем проекта)
//переменная, в которую кладется зависимость
//и колбэк, в котором просто добавляется зависимость на сайт
function addDependency(nameDependency, nameProject, variableDependency, callback){
  //Получаем массив детей на форме добавления зависимостей
  let formDependency = document.getElementById("divAddingDependencies").children;
  //Приравниваем инпуты к переменным
  let nameDependencyInput = formDependency[2];
  let variableDependencyInput = formDependency[1];
  //Нам нужен еще заголовок, чтобы туда писать ошибки
  let pDependency = formDependency[0];
  //Если не введено имя переменной, то алармим об этом
  if(!nameDependency){
    //Сбрасываем поля и заголовок
    document.getElementById("divAddingDependencies").style.borderColor = "grey";
    variableDependencyInput.style.borderColor = "";
    //Выделяем поле переменной красным
    nameDependencyInput.style.borderColor = "red";
    //Вводим в заголовке что не так
    pDependency.innerHTML = "Введите имя в npm";
  } else if(!variableDependency){
    //Если не введено название зависимости, то алармим об этом
    //Сбрасываем поля и заголовок
    document.getElementById("divAddingDependencies").style.borderColor = "grey";
    nameDependencyInput.style.borderColor = "";
    //Выделяем поле переменной красным
    variableDependencyInput.style.borderColor = "red";
    //Вводим в заголовке что не так
    pDependency.innerHTML = "Введите имя переменной";
  } else {
    //Сбрасываем поля и заголовок
    document.getElementById("divAddingDependencies").style.borderColor = "grey";
    variableDependencyInput.style.borderColor = "";
    nameDependencyInput.style.borderColor = "";
    //добавим надпись загрузки, когда лоадится плагин
    //Как только направляем реквест в форме добавления зависимости все убираем
    //оставляем только надпись "загрузка"
    axios.interceptors.request.use(function (config) {
      pDependency.innerHTML = "Загрузка зависимости";
      nameDependencyInput.style.display="none";
      variableDependencyInput.style.display="none";
      //кнопка добавления
      formDependency[3].style.display = "none";
      //кнопка закрытия
      formDependency[4].style.display = "none";
      return config;
    }, function (error) {
      return Promise.reject(error);
    });

    //Как только пришел респонс возвращаем все на форму добавления
    axios.interceptors.response.use(function (response) {
      pDependency.innerHTML = "Зависимость загружена";
      //Восстанавливаем видимость блоков
      nameDependencyInput.style.display="inline-block";
      variableDependencyInput.style.display="inline-block";
      //кнопка добавления
      formDependency[3].style.display = "inline-block";
      //кнопка закрытия
      formDependency[4].style.display = "inline-block";
      return response;
    }, function (error) {
      return Promise.reject(error);
    });
    //Аксиосом постим данные
    axios({
      method:'post',
      url:'http://localhost/addDependency',
      data: {nameDependency, nameProject, variableDependency}
    }).then((response)=>{
      //Проверяем не прилетела ли ошибка, что такой заивисомсти нет
      if(response.data.error){
        //В заголовке пишем что не так
        pDependency.innerHTML = "Нет в npm";
        //выделим красным поле имени зависимости
        nameDependencyInput.style.borderColor = "red";
        //ввыделим красным всю форму
        //Самое классное, что таким способом не надо заморачиваться с important
        document.getElementById("divAddingDependencies").style.borderColor = "red";
      } else{
        //Сбрасываем цвет бордера
        document.getElementById("divAddingDependencies").style.borderColor = "grey";
        //Если все ок, колбэким уже распарсенный JSON
        callback(response);
      }
    })
  }
}
function loadProject(){
  //поиск элемента-родителя куда форму вставлять
  let element = document.getElementById('meetings');
  //Очищаем форму
  element.innerText = "";
  //Создаем инпут для имени проекта
  let inputFile = document.createElement('input');
  inputFile.type = "file";
  inputFile.onchange = function(){
    readFile(this)
  };
  //Добавляем форму на сайт
  element.appendChild(inputFile);

  let buttonBack = document.createElement('button');

  buttonBack.textContent = 'Назад';

  element.appendChild(buttonBack);
  
  buttonBack.addEventListener('click', ()=>{backToMeeting()});
}

function backToMeeting(){
  //поиск элемента-родителя куда форму вставлять
  let element = document.getElementById('meetings');
  //Очищаем форму
  element.innerText = "";
  //Создаем инпут для имени проекта
  let title = document.createElement('h1');
  let buttonMakeProject = document.createElement('button');
  let buttonLoadProject = document.createElement('button');

  title.textContent = 'Добро пожаловать в Эмили!';
  buttonMakeProject.textContent = 'Создать новый проект';
  buttonLoadProject.textContent = 'Загрузить имеющийся';

  element.appendChild(title);
  element.appendChild(buttonMakeProject);
  element.appendChild(buttonLoadProject);
  
  buttonMakeProject.addEventListener('click', ()=>{showPanelForMakingNewProject()});
  buttonLoadProject.addEventListener('click', ()=>{loadProject()});
}




function readFile(input) {
  let file = input.files[0];
  //Надо получить имя проекта
  //И еще надо учесть, что файл читается с расширением
  //Поэтому надо делать ласт индекс оф имени
  //и сплитить по нему

  let nameProject = file.name.slice(0, file.name.lastIndexOf("."));

  let reader = new FileReader();

  reader.readAsText(file);

  reader.onload = function() {
    createProject(nameProject, ()=>{
      showWorkPlace(nameProject); 
      addWorkPlace();
      load(reader.result);
    });
  };

  reader.onerror = function() {
    console.log(reader.error);
  };
function getModules(){
  axios({
    method:'post',
    url:'http://localhost/getModule',
    data: {name: nameFolder}
  }).then((response)=>{
    let modules = response.data;
    let moduleScript = document.createElement('script');
    moduleScript.defer = true;
    moduleScript.text = `let modules = ${modules}`;
    document.body.appendChild(moduleScript);
    moduleScript.addEventListener('load', console.log($('h1').text()))
  })
}
function showPanelForMakingNewProject(){
  let divMakingNewProject = document.createElement('div');
  let inputNameProject = document.createElement('input');
  let buttonSendDataToServer = document.createElement('button');
  divMakingNewProject.appendChild(inputNameProject);
  divMakingNewProject.appendChild(buttonSendDataToServer);
  inputNameProject.placeholder = 'Enter name of your new Project';
  buttonSendDataToServer.textContent = 'Create Project';
  buttonSendDataToServer.addEventListener('click', ()=>{createProject(inputNameProject.value, ()=>{showPanelForAddingDependencies(inputNameProject.value); addWorkPlace()})});
  document.body.appendChild(divMakingNewProject);
}
function showPanelForAddingDependencies(nameProject){
  let divAddingDependencies = document.createElement('div');
  let divDependencies = document.createElement('div');
  let variableDependencies = document.createElement('input');
  let inputDependencies = document.createElement('input');
  let buttonAddingDependencies = document.createElement('button');
  divAddingDependencies.appendChild(variableDependencies);
  divAddingDependencies.appendChild(inputDependencies);
  divAddingDependencies.appendChild(buttonAddingDependencies);
  divAddingDependencies.appendChild(divDependencies);
  inputDependencies.placeholder = 'Enter dependency';
  buttonAddingDependencies.textContent = 'Add to Project';
  buttonAddingDependencies.addEventListener('click', ()=>{addDependency(inputDependencies.value, nameProject, variableDependencies.value, (response)=>{
    let newDependency = document.createElement('div');
    let newDependencyCode = document.createElement('p');
    newDependencyCode.textContent += `let ${variableDependencies.value} = '${inputDependencies.value}';`;
    newDependency.appendChild(newDependencyCode);
    divDependencies.appendChild(newDependency);
    //adding scripttag
    let modules = response.data;
    let moduleScript = document.createElement('script');
    moduleScript.defer = true;
    moduleScript.text = `let ${variableDependencies.value}req = ${modules}; let ${variableDependencies.value} = ${variableDependencies.value}req('${inputDependencies.value}');`;
    document.body.appendChild(moduleScript);
    moduleScript.addEventListener('load', console.log('added'))
    variableDependencies.value = "";
    inputDependencies.value = "";
  })});
  document.body.appendChild(divAddingDependencies);
}
function addWorkPlace(){
  let divBody = document.createElement('div');
  let divSample = document.createElement('div');
  let divMyDiagram = document.createElement('div');
  let textAreaEditor = document.createElement('textarea');
  let buttonSave = document.createElement('button');
  let buttonAddFunc = document.createElement('button');

  divSample.id = 'sample';
  divMyDiagram.id = 'myDiagramDiv';
  textAreaEditor.id = 'mySavedModel';
  buttonSave.id = 'SaveButton';
  buttonAddFunc.id = 'addFunc';

  divMyDiagram.setAttribute('style', 'width:600px; height:500px; border:1px solid black');
  textAreaEditor.setAttribute('style', 'width:100%;height:250px');

  buttonSave.textContent = 'Save';
  buttonAddFunc.textContent = 'Add Function';

  divSample.appendChild(divMyDiagram);
  divSample.appendChild(textAreaEditor);
  divSample.appendChild(buttonSave);
  divSample.appendChild(buttonAddFunc);
  divBody.appendChild(divSample);
  document.body.appendChild(divBody);  
  
  buttonSave.addEventListener('click', ()=>{save()});
  buttonAddFunc.addEventListener('click', ()=>{addFunc.call(addFunc)});
  divBody.onload = init();
}

function createProject(nameProject, callback){
  if(!nameProject){
    console.log('Enter Name');
  } else {
    axios({
      method:'post',
      url:'http://localhost/newProject',
      data: {name: nameProject}
    }).then((response)=>{
      callback(response);
    })
  }
}
function addDependency(nameDependency, nameProject, variableDependency, callback){
  if(!nameDependency){
    console.log('Enter dependency');
  } else {
    axios({
      method:'post',
      url:'http://localhost/addDependency',
      data: {nameDependency, nameProject, variableDependency}
    }).then((response)=>{
      callback(response);
    })
  }
}}
