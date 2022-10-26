window.onload = () => {
  const div = document.getElementById('grid')
  const bombs_display = document.getElementById("bombs");
  const cells_display = document.getElementById("cells");

  const row_input = document.getElementById("rows");
  const col_input = document.getElementById("cols");
  const dim_input = document.getElementById("dim");
  const save_configs = document.getElementById("save")
  const fullScreen = document.getElementById("fullscreen")

  const menu = document.getElementById("menu")
  const body = document.body;

  var isOpenDisplay = false

  const tooltip = document.getElementById("tooltip")

  const shovel_input = document.getElementById("chooseShovel")
  const flag_input = document.getElementById("chooseFlag")

  var isFullScreen = false;
  var target = null;

  var map;
  var dim = 40;
  var multiplier = 0.6

  if (window.innerWidth < 768.0) {
    multiplier = 0.9
  }

  var rows = Math.floor(window.innerHeight / dim * multiplier);
  var cols = Math.floor(window.innerWidth / dim * multiplier);
  row_input.value = rows;
  col_input.value = cols;
  dim_input.value = dim;

  save_configs.onclick = (event) => {
    rows = parseInt(row_input.value)
    cols = parseInt(col_input.value)
    dim = parseInt(dim_input.value)

    start()
    hide_display()
  }

  menu.onclick = (event) => {
    if (isOpenDisplay) {
      hide_display()
    } else {
      show_display()
    }
  }

  var firstOpen = true;

  var needToOpenCells = rows * cols;
  var bombsLeft = 0;

  start()


  function start() {
    document.documentElement.style.setProperty('--rows', rows)
    document.documentElement.style.setProperty('--cols', cols)
    document.documentElement.style.setProperty('--dim', dim + "px")
    document.documentElement.style.setProperty('--width', window.innerWidth + "px")
    document.documentElement.style.setProperty('--height', window.innerHeight + "px")
    needToOpenCells = rows * cols;
    bombsLeft = 0;

    setupGame()
    draw()
    hint()
  }

  function setupGame() {
    div.innerHTML = '';

    map = createMap()

    placebombs()
    placeNumbers()
    shovel_input.onclick = () => {
      handleInput(false)
    }

    flag_input.onclick = () => {
      handleInput(true)
    }

    fullScreen.onclick = () => {
      var elem = document.documentElement
      if (elem.requestFullscreen) {
        elem.requestFullscreen({ navigationUI: "hide" })
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen({ navigationUI: "hide" })
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen({ navigationUI: "hide" })
      } else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen({ navigationUI: "hide" })
      }
    }
  }

  function hint() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (map[i][j] == 0) {
          var cell = document.getElementById(i + "_" + j)
          cell.classList.add("hint")
          return;
        }
      }
    }
  }

  function createMap() {
    let maps = Array.of()
    for (var i = 0; i < rows; i++) {
      var row = Array.of()
      for (var j = 0; j < cols; j++) {
        row.push(0)
      }
      maps[i] = row
    }
    return maps;
  }

  function draw() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        var elem = document.createElement("p")
        if (map[i][j] != 0) {
          elem.innerHTML = map[i][j]
        }

        if (map[i][j] == "b") {
          elem.classList.add("bomb")
        } else {
          elem.classList.add(map[i][j])
        }

        elem.classList.add("cover");
        elem.setAttribute("row", i);
        elem.setAttribute("col", j);
        elem.setAttribute("id", "" + i + "_" + j)
        elem.addEventListener('click', (event) => {
          moveTooltip(event)
        });
        elem.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          moveTooltip(event)
          return false;
        }, false)
        div.appendChild(elem)
      }
    }

    draw_displays()
  }

  function placebombs() {
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (Math.random() * 100 < 20) {
          map[i][j] = "b"
          bombsLeft++;
          needToOpenCells--;
        }
      }
    }
  }

  function handleInput(flag) {
    if (firstOpen) {
      var hint = document.querySelector(".hint")
      hint.classList.remove("hint")
      firstOpen = false;
    }

    if (flag) {
      setFlag(target)
    } else {
      openCell(target);
    }
    resetTooltip()
  }

  function openCell(cell) {

    var row = parseInt(cell.getAttribute("row"));
    var col = parseInt(cell.getAttribute("col"));


    if (map[row][col] == "b") {
      cell.classList.remove("cover");
      lose()
    } else if (map[row][col] == 0) {
      openRecursive(row, col);
      cell.classList.remove("cover");
    } else {
      cell.classList.remove("cover");
      needToOpenCells--;
      draw_displays()
    }

  }

  function lose() {
    var interval = 0;
    var gap = 2000/(rows * cols);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (map[i][j] == 'b') {
          setTimeout(() => {
            var cell = document.getElementById(i + "_" + j)
            cell.classList.remove("cover")
          }, interval)
          interval += gap
        } 
      }
    }

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (map[i][j] != 'b') {
          setTimeout(() => {
            var cell = document.getElementById(i + "_" + j)
            cell.classList.remove("cover")
          }, interval)
          interval += gap*2
        }
      }
    }

    quake()
  }

  function quake() {
    div.classList.add("apply-shake")
    body.classList.add("gameover")
    document.documentElement.classList.add("gameover")
  }

  function setFlag(elem) {
    if (elem.classList.contains("flag")) {
      elem.classList.remove("flag")
      elem.classList.add("cover")
      bombsLeft++;
    } else {
      elem.classList.add("flag")
      elem.classList.remove("cover")
      bombsLeft--;
    }
    draw_displays()
  }

  function openRecursive(row, col) {
    var cell = document.getElementById(row + "_" + col)

    if (row == -1 || col == -1 || row == rows || col == cols) return;
    if (map[row][col] == 'b') return;

    var comeFromWhite = map[row][col] == 0;

    if (!cell.classList.contains("cover")) return;
    cell.classList.remove("cover");
    if (cell.classList.contains("hint")) {
      cell.classList.remove("hint")
    }

    needToOpenCells--;
    draw_displays()

    if (!comeFromWhite) {
      return;
    }

    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        if (i != 0 || j != 0) {
          openRecursive(row + i, col + j)
        }

      }
    }
  }

  function draw_displays() {
    bombs_display.innerHTML = "Bombs left : " + bombsLeft;
    cells_display.innerHTML = "Cells left : " + needToOpenCells;
  }

  function hide_display() {
    body.classList.add("hide")
    isOpenDisplay = false;
  }

  function show_display() {
    body.classList.remove("hide")
    isOpenDisplay = true;
  }

  function moveTooltip(event) {
    var classList = event.target.classList
    if (!classList.contains("cover") && !classList.contains("flag")) {
      resetTooltip();
      return;
    }

    tooltip.classList.remove("hide")

    target = event.target
    var cell = target.getBoundingClientRect();

    tooltip.style.left = Math.floor(cell.left - (dim / 2)) + "px"
    var top = (Math.floor(Math.abs(window.innerHeight - cell.bottom)) < dim + 10) ? cell.top - dim : cell.bottom
    tooltip.style.top = Math.floor(top) + "px"
  }

  function resetTooltip() {
    tooltip.classList.add("hide");
  }


  function placeNumbers() {
    for (let i = 0; i < rows; i++) {

      for (let j = 0; j < cols; j++) {
        if (map[i][j] == "b") {

          //destra
          if (j != cols - 1) {
            if (map[i][j + 1] != "b") {
              map[i][j + 1] = map[i][j + 1] + 1
            }
          }

          //alto-destra
          if (i != 0 && j != cols - 1) {
            if (map[i - 1][j + 1] != "b") {
              map[i - 1][j + 1] = map[i - 1][j + 1] + 1
            }
          }

          //alto
          if (i != 0) {
            if (map[i - 1][j] != "b") {
              map[i - 1][j] = map[i - 1][j] + 1
            }
          }

          //alto sinistra
          if (i != 0 && j != 0) {
            if (map[i - 1][j - 1] != "b") {
              map[i - 1][j - 1] = map[i - 1][j - 1] + 1
            }
          }

          //sinistra
          if (j != 0) {
            if (map[i][j - 1] != "b")
              map[i][j - 1] = map[i][j - 1] + 1
          }

          //sotto-destra
          if (i != rows - 1 && j != cols - 1) {
            if (map[i + 1][j + 1] != "b") {
              map[i + 1][j + 1] = map[i + 1][j + 1] + 1
            }
          }

          //sotto
          if (i != rows - 1) {
            if (map[i + 1][j] != "b") {
              map[i + 1][j] = map[i + 1][j] + 1
            }
          }

          //sotto sinistra
          if (i != rows - 1 && j != 0) {
            if (map[i + 1][j - 1] != "b") {
              map[i + 1][j - 1] = map[i + 1][j - 1] + 1
            }
          }
        }
      }
    }
  }
}