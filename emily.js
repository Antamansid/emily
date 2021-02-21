function init() {
  //Инициализация мэйкера
  let $ = go.GraphObject.make;  
  //Говорим куда рисовать рабочее поле
  myDiagram =
    $(go.Diagram, "myDiagramDiv",  
      { "undoManager.isEnabled": true });

  //Ставим листенер на нарисованную стрелку
  //В таком случае все return функций пересчитываются
  //Причем пересчитываются только те, куда стрелка была нарисована
  myDiagram.addDiagramListener("LinkDrawn", function(e) {
    //Первым надо получить инфу с какой функции пришла стрелка
    let fromNode = e.subject.fromNode.key;
    //Теперь получить инфу по порту, с которого прилетела стрелка
    //Так как выход с функции 1, найти его легко
    //В порте хранится результат работы функции
    //ID Port текстовый, и состоит из расположения (top/bottom к примеру) + индекс в массиве
    //Нам нужен этот индекс
    let fromPort = +e.subject.fromPortId[e.subject.fromPortId.length - 1];
    //Получаем инфу куда стрелка намалевалась
    let toNode = e.subject.toNode;
    //Куда стрелка намалевалась по порту (айди порта) сразу преобразуем в число плюсом
    let toPort = +e.subject.toPortId[e.subject.toPortId.length - 1];
    //Отлично! Получаем теперь результат функции, от которой нарисовалась стрелка
    let inputData = myDiagram.model.nodeDataArray[fromNode].bottomArray[fromPort].return;
    //И пихаем результат в переменную новой функции (порт сверху) по стандарту topX-где X номер.
    myDiagram.model.setDataProperty(toNode.data.topArray[toPort], "get", inputData);
    //Далее идет релиз по апдейту ветки
    //НЕ РЕЛАЛИЗОВАНО
    //Сначала принимаем входящие параметры
    //Перебираем все стрелки
    myDiagram.model.linkDataArray.forEach((link, i, linkDataArray)=>{
      //в стрелке есть from, fromPort, to, toPort
      //Входящие параметры лежат в toPort
      //Но чтобы оттуда взять данные надо найти ноду по from
      let node = myDiagram.model.nodeDataArray.find((elem, index, array)=>{
        if(elem.key === link.from){
          return elem;
        } else {
          return false;
        }
      });
    })
    //Потом делаем с ними то, что описано в функции
    //Потом записываем все это в ретерн в боттом
  });

  
  myDiagram.addDiagramListener('ChangedSelection', (e)=>{
    console.log('changed');
    let func = document.getElementById("funcText");
    //Здесь может возникнуть проблема
    e.subject.each((node)=>{
      console.log(e.subject);
      console.log(node);
      console.log(node.data);
      console.log(node.data.functionBabled);
      func.value = node.data.functionNotBabled;
    });
    console.log('changed End');
  })

  myDiagram.addDiagramListener('ClipboardChanged', (e)=>{
    console.log('clipTakeson');
    e.subject.each((node)=>{
      console.log(node.data);
      //Мне кажется это не устойчиво, но все таки надо было это сделать
      //Ключ новой функции это длина массива
      //При старте проекта ключ первой функции 0, Длина массива 1
      //При добавлении новой функции ее ключ - длина массива 1
      //А длина массива уже увеличивается к 2.
      //Замкнутый круг
    });
    console.log('clipTakeson');
  })

  myDiagram.addDiagramListener('ClipboardPasted', (e)=>{
    console.log('clipTakesoff');
    e.subject.each((node)=>{
      console.log(node.data);
      //Мне кажется это не устойчиво, но все таки надо было это сделать
      //Ключ новой функции это длина массива
      //При старте проекта ключ первой функции 0, Длина массива 1
      //При добавлении новой функции ее ключ - длина массива 1
      //А длина массива уже увеличивается к 2.
      //Замкнутый круг
      let key = myDiagram.model.nodeDataArray.length;
      node.data.key = key;
    });
    console.log('clipTakesoff');
  })

  //Функция создания кнопки контекстного меню
  function makeButton(text, action, visiblePredicate) {
    //возвращаем кнопку контекстного меню с текстом и экшном
    return $("ContextMenuButton",
      $(go.TextBlock, text),
      { click: action },
      //чего-то советуют, но мы везде игнорим это, хехе
      // don't bother with binding GraphObject.visible if there's no predicate
      visiblePredicate ? new go.Binding("visible", "", function(o, e) { return o.diagram ? visiblePredicate(o, e) : false; }).ofObject() : {});
  }

  //Релиз контекстного меню
  var nodeMenu =  
    $("ContextMenu",
      //Копирование функции
      //ООП подрузамевает отсутствие копированного кода в проекте
      //Поэтому закоментил
      /*makeButton("Copy",
        function(e, obj) { e.diagram.commandHandler.copySelection(); }),*/
      //Удаление функции
      makeButton("Удалить",
        function(e, obj) { e.diagram.commandHandler.deleteSelection(); }),
      makeButton("Добавить входную переменную",
        function(e, obj) { addPort("top"); }),
        //Подумать над этим!!!
      makeButton("Добавить тествход",
        function(e, obj) { addPort("left"); }),
      makeButton("Добавить тествыход",
        function(e, obj) { addPort("right"); })
        //Выход у функции 1, поэтому убираем это
      /*makeButton("Add bottom port",
        function(e, obj) { addPort("bottom"); }),*/
    );
  //Задаем размеры квадратика порта
  var portSize = new go.Size(8, 8);
  //Контекстное меню порта
  var portMenu =  
    $("ContextMenu",
      //Свап нам не нужен
      /*makeButton("Swap order",
        function(e, obj) { swapOrder(obj.part.adornedObject); }),*/
      //Удаление порта
      //Допилить проверку по bottom чтобы не удалить выход с функции
      makeButton("Удалить переменную",
        // in the click event handler, the obj.part is the Adornment;
        // its adornedObject is the port
        function(e, obj) { removePort(obj.part.adornedObject); }),
        //Изменить цвет порта. Просто для красоты
      makeButton("Изменить цвет порта",
        function(e, obj) { changeColor(obj.part.adornedObject); }),
        //Удалить порты скопом со стороны. Если только входы
        //Добавить проверку
      makeButton("Удалить все переменные",
        function(e, obj) { removeAll(obj.part.adornedObject); })
    );

  //КОнструктор нарисованного тела функции
  myDiagram.nodeTemplate =
  //представляем в виде таблицы
    $(go.Node, "Table",
      {
        locationObjectName: "BODY",
        locationSpot: go.Spot.Center,
        selectionObjectName: "BODY",
        contextMenu: nodeMenu
      },
      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),

      //описываем тело
      $(go.Panel, "Auto",
        {
          row: 1, column: 1, name: "BODY",
          stretch: go.GraphObject.Fill
        },
        //представляем функцию в виде квадрата
        $(go.Shape, "Rectangle",
          {
            //закрашиваем его и задаем минимальный размер, который будет увеличиваться по мере добавления входящих портов
            fill: "#AC193D", stroke: null, strokeWidth: 0,
            minSize: new go.Size(56, 56)
          }),
          //добавляем текст на квадрат. Изначально все называется как New Func
        $(go.TextBlock,
          { margin: 10, textAlign: "center", font: "14px  Segoe UI,sans-serif", stroke: "white", editable: true },
          new go.Binding("text", "name").makeTwoWay())
      ),
      //Добавляем порты
      //Входящие порты для тестинга
      //Переделать!
      /*$(go.Panel, "Vertical",
      //задаем как массив
        new go.Binding("itemArray", "leftArray"),
        {
          //задаем расположение
          row: 1, column: 0,
          //задаем наполнение
          itemTemplate:
          //впихиваем панель
            $(go.Panel,
              {
                //не стандарт gojs
                //здесь просто запихивает в переменную объекта инфа о расположении
                _side: "left",  
                //как нарисовать стрелку
                fromSpot: go.Spot.Left, toSpot: go.Spot.Left,
                //можно ли нарисовать стрелку
                fromLinkable: true, toLinkable: true, cursor: "pointer",
                //задаем контекстное меню
                contextMenu: portMenu
              },
              //биндим при подгрузке ссылку к значению
              new go.Binding("portId", "portId"),
              //теперь рисуем порт в виде квадрата
              $(go.Shape, "Rectangle",
                {
                  stroke: null, strokeWidth: 0,
                  desiredSize: portSize,
                  margin: new go.Margin(1, 0)
                },
                new go.Binding("fill", "portColor"))
            ) 
        }
      ),*/

      // порты-переменные
      $(go.Panel, "Horizontal",
      //ну как всегда, принимаем как массив
        new go.Binding("itemArray", "topArray"),
        {
          //0 строчка
          row: 0, column: 1,
          //задаем содержание
          itemTemplate:
          //расположение вертикальное вверху порт снизу название переменной
            $(go.Panel, "Vertical",
              {
                //нестандарт gojs, я бы сказал фильтр кгда происходит импорт массива
                //он считывает это поле и если поле топ, то пихаем переменную вверх
                _side: "top",
                //откуда и куда стрелки рисовать
                fromSpot: go.Spot.Top, toSpot: go.Spot.Top,
                //можно ли рисовать к нему стрелку и от него
                fromLinkable: true, toLinkable: true, cursor: "pointer",
                //контекстное меню
                contextMenu: portMenu
              },
              //биндим портайди
              new go.Binding("portId", "portId"),
              //рисуем сам квадратик порта
              $(go.Shape, "Rectangle",
                {
                  //его характеристики
                  stroke: null, strokeWidth: 0,
                  desiredSize: portSize,
                  margin: new go.Margin(0, 1)
                },
                //цвет порта
                new go.Binding("fill", "portColor")),
                //айди порта, это же и название переменной
              $(go.TextBlock, new go.Binding("text", "portId"))
            )  
        }
      ),  

      //тоже тестовый порт
      //надо додумать концепцию
      /*$(go.Panel, "Vertical",
      //биндится из какого массива берется значение (значения)
        new go.Binding("itemArray", "rightArray"),
        {
          //расположение -строка 1 колонка 2
          row: 1, column: 2,
          itemTemplate:
            $(go.Panel,
              {
                //стрелка куда откуда и контекстное меню
                _side: "right",
                fromSpot: go.Spot.Right, toSpot: go.Spot.Right,
                fromLinkable: true, toLinkable: true, cursor: "pointer",
                contextMenu: portMenu
              },
              //биндим портайди
              new go.Binding("portId", "portId"),
              //декорируем сам порт в виде квадратика
              $(go.Shape, "Rectangle",
                {
                  stroke: null, strokeWidth: 0,
                  desiredSize: portSize,
                  margin: new go.Margin(1, 0)
                },
                //задаем цвет
                new go.Binding("fill", "portColor"))
            )  
        }
      ),*/
      //это нижняя панель с портом выхода
      //порт выхода 1 единственный!
      $(go.Panel, "Horizontal",
      //биндим откуда брать данные
        new go.Binding("itemArray", "bottomArray"),
        {
          row: 2, column: 1,
          itemTemplate:
          $(go.Panel, "Vertical",
            {
              //стрелка откуда куда и контекстное меню
              _side: "bottom",
              fromSpot: go.Spot.Bottom, toSpot: go.Spot.Bottom,
              fromLinkable: true, toLinkable: true, cursor: "pointer",
              contextMenu: portMenu
            },
            $(go.TextBlock, new go.Binding("text", "return")),
            new go.Binding("portId", "portId"),
            $(go.Shape, "Rectangle",
              {
                stroke: null, strokeWidth: 0,
                desiredSize: portSize,
                margin: new go.Margin(0, 1)
              },
              new go.Binding("fill", "portColor")),
          )   // end itemTemplate
        }
      )  // end Horizontal Panel
    );  // end Node
  // an orthogonal link template, reshapable and relinkable
  myDiagram.linkTemplate =
    $(CustomLink,  // defined below
      {
        routing: go.Link.AvoidsNodes,
        corner: 4,
        curve: go.Link.JumpGap,
        reshapable: true,
        resegmentable: true,
        relinkableFrom: true,
        relinkableTo: true
      },
      new go.Binding("points").makeTwoWay(),
      $(go.Shape, { stroke: "#2F4F4F", strokeWidth: 2 })
    );

  myDiagram.contextMenu =
    $("ContextMenu",
      makeButton("Вставить",
        function(e, obj) { e.diagram.commandHandler.pasteSelection(e.diagram.lastInput.documentPoint); },
        function(o) { return o.diagram.commandHandler.canPasteSelection(); }),
      makeButton("Шаг назад",
        function(e, obj) { e.diagram.commandHandler.undo(); },
        function(o) { return o.diagram.commandHandler.canUndo(); }),
      makeButton("Шаг вперед",
        function(e, obj) { e.diagram.commandHandler.redo(); },
        function(o) { return o.diagram.commandHandler.canRedo(); }),
      makeButton("Добавить",
        function(e, obj) {
          myDiagram.startTransaction("add node");
          //Гетим координату х где кликнули мышью
          let xCoord = e.diagram.toolManager.contextMenuTool.mouseDownPoint.x;
          //Гетим координату у где кликнули мышью
          let yCoord = e.diagram.toolManager.contextMenuTool.mouseDownPoint.y;
          //Мне кажется это не устойчиво, но все таки надо было это сделать
          //Ключ новой функции это длина массива
          //При старте проекта ключ первой функции 0, Длина массива 1
          //При добавлении новой функции ее ключ - длина массива 1
          //А длина массива уже увеличивается к 2.
          //Замкнутый круг
          let key = myDiagram.model.nodeDataArray.length;
          //Создаем ноду. Имя должно быть уникальным!!!
          let node = {name: `newFunction${key}`, key: key, loc: `${xCoord} ${yCoord}`, leftArray:[], topArray:[], bottomArray:[ {portColor:"black", portId:"bottom0"} ], rightArray:[]};
          myDiagram.model.addNodeData(node);   
          myDiagram.commitTransaction("add node"); }),
      makeButton("Добавить плагин",
        function(e, obj) {
            addDepend();
          }),
      makeButton("Сохранить проект",
        function(e, obj) {
            saveProject();
          }),
      makeButton("Сохранить код",
        function(e, obj) {
          }),
      makeButton("Сохранить babled-код",
        function(e, obj) {
          })
    );
    loadDiagram();
}


// This custom-routing Link class tries to separate parallel links from each other.
// This assumes that ports are lined up in a row/column on a side of the node.
function CustomLink() {
  go.Link.call(this);
};
go.Diagram.inherit(CustomLink, go.Link);

CustomLink.prototype.findSidePortIndexAndCount = function(node, port) {
  var nodedata = node.data;
  if (nodedata !== null) {
    var portdata = port.data;
    var side = port._side;
    var arr = nodedata[side + "Array"];
    var len = arr.length;
    for (var i = 0; i < len; i++) {
      if (arr[i] === portdata) return [i, len];
    }
  }
  return [-1, len];
};

CustomLink.prototype.computeEndSegmentLength = function(node, port, spot, from) {
  var esl = go.Link.prototype.computeEndSegmentLength.call(this, node, port, spot, from);
  var other = this.getOtherPort(port);
  if (port !== null && other !== null) {
    var thispt = port.getDocumentPoint(this.computeSpot(from));
    var otherpt = other.getDocumentPoint(this.computeSpot(!from));
    if (Math.abs(thispt.x - otherpt.x) > 20 || Math.abs(thispt.y - otherpt.y) > 20) {
      var info = this.findSidePortIndexAndCount(node, port);
      var idx = info[0];
      var count = info[1];
      if (port._side == "top" || port._side == "bottom") {
        if (otherpt.x < thispt.x) {
          return esl + 4 + idx * 8;
        } else {
          return esl + (count - idx - 1) * 8;
        }
      } else {  // left or right
        if (otherpt.y < thispt.y) {
          return esl + 4 + idx * 8;
        } else {
          return esl + (count - idx - 1) * 8;
        }
      }
    }
  }
  return esl;
};

CustomLink.prototype.hasCurviness = function() {
  if (isNaN(this.curviness)) return true;
  return go.Link.prototype.hasCurviness.call(this);
};

CustomLink.prototype.computeCurviness = function() {
  if (isNaN(this.curviness)) {
    var fromnode = this.fromNode;
    var fromport = this.fromPort;
    var fromspot = this.computeSpot(true);
    var frompt = fromport.getDocumentPoint(fromspot);
    var tonode = this.toNode;
    var toport = this.toPort;
    var tospot = this.computeSpot(false);
    var topt = toport.getDocumentPoint(tospot);
    if (Math.abs(frompt.x - topt.x) > 20 || Math.abs(frompt.y - topt.y) > 20) {
      if ((fromspot.equals(go.Spot.Left) || fromspot.equals(go.Spot.Right)) &&
        (tospot.equals(go.Spot.Left) || tospot.equals(go.Spot.Right))) {
        var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
        var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
        var c = (fromseglen - toseglen) / 2;
        if (frompt.x + fromseglen >= topt.x - toseglen) {
          if (frompt.y < topt.y) return c;
          if (frompt.y > topt.y) return -c;
        }
      } else if ((fromspot.equals(go.Spot.Top) || fromspot.equals(go.Spot.Bottom)) &&
        (tospot.equals(go.Spot.Top) || tospot.equals(go.Spot.Bottom))) {
        var fromseglen = this.computeEndSegmentLength(fromnode, fromport, fromspot, true);
        var toseglen = this.computeEndSegmentLength(tonode, toport, tospot, false);
        var c = (fromseglen - toseglen) / 2;
        if (frompt.x + fromseglen >= topt.x - toseglen) {
          if (frompt.y < topt.y) return c;
          if (frompt.y > topt.y) return -c;
        }
      }
    }
  }
  return go.Link.prototype.computeCurviness.call(this);
};
// end CustomLink class


// Add a port to the specified side of the selected nodes.
function addPort(side) {
  myDiagram.startTransaction("addPort");
  myDiagram.selection.each(function(node) {
    // skip any selected Links
    if (!(node instanceof go.Node)) return;
    // compute the next available index number for the side
    var i = 0;
    while (node.findPort(side + i.toString()) !== node) i++;
    // now this new port name is unique within the whole Node because of the side prefix
    var name = side + i.toString();
    // get the Array of port data to be modified
    var arr = node.data[side + "Array"];
    if (arr) {
      // create a new port data object
      var newportdata = {
        portId: name,
        portColor: go.Brush.randomColor()
        // if you add port data properties here, you should copy them in copyPortData above
      };
      // and add it to the Array of port data
      myDiagram.model.insertArrayItem(arr, -1, newportdata);
    }
  });
  myDiagram.commitTransaction("addPort");
}

/*
Удалить!
function addOnlyPort(side, node) {
  myDiagram.startTransaction("addPort");
    // now this new port name is unique within the whole Node because of the side prefix
    var name = 'bottom0';
    // get the Array of port data to be modified
    var arr = node[side + "Array"];
    if (arr) {
      // create a new port data object
      var newportdata = {
        portId: name,
        portColor: go.Brush.randomColor()
        // if you add port data properties here, you should copy them in copyPortData above
      };
      // and add it to the Array of port data
      myDiagram.model.insertArrayItem(arr, -1, newportdata);
    }
  myDiagram.commitTransaction("addPort");
}*/

// Add function
function addFunc() {
  myDiagram.startTransaction("addData");
  myDiagram.selection.each(function(node) {
    if (!(node instanceof go.Node)) return;
    let variables = "";
    let variablesData = [];
    //перебираем и присваем переменные для модуля
    if(node.data.topArray.length>0){
      node.data.topArray.forEach((item, i, arr)=>{
        if(i >0){
          variables += ", ";
        }
        variables += item.portId;
        variablesData.push(item.get);
      });
    }
    let result = "";
    //Возьмем тело функции
    let func = document.getElementById("funcText").value;
    node.data.functionNotBabled = func;
    //Обернем ее в функцию для бабела
    //И сделаем так, чтобы она сразу выполнялась
    let funcStet = `(function () {${func}}())`;
    //Отбаблим ее
    //Если не поставить ретерн, анонимная функция вернет undefined
    let babledFunc = `return ${Babel.transform(funcStet, {presets:['react']}).code}`;
    node.data.functionBabled = babledFunc;
    //Теперь сделаем объект функции
    let readyFunc = new Function(variables, babledFunc);
    //Теперь выполним ее
    result = readyFunc.apply(this, variablesData);
    myDiagram.model.setDataProperty(node.data.bottomArray[0], "return", result);
    //node.findNodesOutOf().each((nodemon)=>{console.log(nodemon.data)});
  });
  myDiagram.commitTransaction("addData");
}

// Exchange the position/order of the given port with the next one.
// If it's the last one, swap with the previous one.
function swapOrder(port) {
  var arr = port.panel.itemArray;
  if (arr.length >= 2) {  // only if there are at least two ports!
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].portId === port.portId) {
        myDiagram.startTransaction("swap ports");
        if (i >= arr.length - 1) i--;  // now can swap I and I+1, even if it's the last port
        var newarr = arr.slice(0);  // copy Array
        newarr[i] = arr[i + 1];  // swap items
        newarr[i + 1] = arr[i];
        // remember the new Array in the model
        myDiagram.model.setDataProperty(port.part.data, port._side + "Array", newarr);
        myDiagram.commitTransaction("swap ports");
        break;
      }
    }
  }
}

// Remove the clicked port from the node.
// Links to the port will be redrawn to the node's shape.
function removePort(port) {
  myDiagram.startTransaction("removePort");
  var pid = port.portId;
  var arr = port.panel.itemArray;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].portId === pid) {
      myDiagram.model.removeArrayItem(arr, i);
      break;
    }
  }
  myDiagram.commitTransaction("removePort");
}

// Remove all ports from the same side of the node as the clicked port.
function removeAll(port) {
  myDiagram.startTransaction("removePorts");
  var nodedata = port.part.data;
  var side = port._side;  // there are four property names, all ending in "Array"
  myDiagram.model.setDataProperty(nodedata, side + "Array", []);  // an empty Array
  myDiagram.commitTransaction("removePorts");
}

// Change the color of the clicked port.
function changeColor(port) {
  myDiagram.startTransaction("colorPort");
  var data = port.data;
  myDiagram.model.setDataProperty(data, "portColor", go.Brush.randomColor());
  myDiagram.commitTransaction("colorPort");
}


// Save the model to / load it from JSON text shown on the page itself, not in a database.
function saveProject() {
  let projectCode = myDiagram.model.toJson();
  //Аксиосом пости на сервер создание нового проекта
  axios({
    method:'post',
    url:'http://localhost/makeFile',
    data: {
      projectCode: projectCode,
      nameProject : document.getElementById('nameProject').innerText
    }
  }).then(()=>{    
    let projectFile = document.createElement('a');
    projectFile.href = document.getElementById('nameProject').innerText + "/projectCode.json";
    projectFile.download = document.getElementById('nameProject').innerText + "/projectCode.json";
    document.body.appendChild(projectFile);
    projectFile.click();
    document.body.removeChild(projectFile);
  })
}
function load(dataInJSON) {
  console.log(dataInJSON);
  let nw = JSON.parse(dataInJSON);
  let nww = JSON.parse(nw);
  console.log(nw);
  console.log(nww);
  myDiagram.model = go.Model.fromJson(nw);
  console.log("loaded");
  console.log(myDiagram.model);
}
function loadDiagram() {
  let jsoned = { "class": "go.GraphLinksModel",
  "copiesArrays": true,
  "copiesArrayObjects": true,
  "linkFromPortIdProperty": "fromPort",
  "linkToPortIdProperty": "toPort",
  "nodeDataArray": [
  {"key":0, "name":"newFunction0", "loc":"101 204",
  "leftArray":[],
  "topArray":[],
  "bottomArray":[ {"portColor":"black", "portId":"bottom0"} ],
  "rightArray":[] }
  ],
  "linkDataArray": []};
  myDiagram.model = go.Model.fromJson(jsoned);

  // When copying a node, we need to copy the data that the node is bound to.
  // This JavaScript object includes properties for the node as a whole, and
  // four properties that are Arrays holding data for each port.
  // Those arrays and port data objects need to be copied too.
  // Thus Model.copiesArrays and Model.copiesArrayObjects both need to be true.

  // Link data includes the names of the to- and from- ports;
  // so the GraphLinksModel needs to set these property names:
  // linkFromPortIdProperty and linkToPortIdProperty.
}