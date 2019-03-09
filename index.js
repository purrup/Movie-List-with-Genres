(function () {
  const BASE_URL = 'https://movie-list.alphacamp.io'
  const INDEX_URL = BASE_URL + '/api/v1/movies/'
  const POSTER_URL = BASE_URL + '/posters/'
  const data = []
  const dataPanel = document.getElementById('data-panel')
  const searchBtn = document.getElementById('submit-search')
  const searchInput = document.getElementById('search')
  const pagination = document.getElementById('pagination')
  const viewPattern = document.getElementById('view-pattern')
  const card = document.getElementById('card')
  const list = document.getElementById('list')
  const table = document.getElementById('table')
  const genresPanel = document.getElementById('genres-list-panel')
  const pageLink = 1
  const ITEM_PER_PAGE = 12
  let paginationData = []
  let pattern = ""
  let results = []
  const genres = {
    "1": "Action",
    "2": "Adventure",
    "3": "Animation",
    "4": "Comedy",
    "5": "Crime",
    "6": "Documentary",
    "7": "Drama",
    "8": "Family",
    "9": "Fantasy",
    "10": "History",
    "11": "Horror",
    "12": "Music",
    "13": "Mystery",
    "14": "Romance",
    "15": "Science Fiction",
    "16": "TV Movie",
    "17": "Thriller",
    "18": "War",
    "19": "Western"
  }

  function displayDataList(data, pattern) {
    if (pattern === "list-pattern") {
      // delete cards
      dataPanel.innerHTML = ''
      // display list
      table.innerHTML = data.map(item => (
        `
          <tr>
            <td class= "td-left">${item.title}</td>
            <td class= "td-right">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </td>
          </tr>
        `
      )).join('')
    } else {
      // delete list
      table.innerHTML = ''
      // display card
      dataPanel.innerHTML = data.map(item => (
        `
        <div class="col-sm-3">
          <div class="card mb-5">
            <img class="card-img-top " src="${POSTER_URL}${item.image}" alt="Card image cap">
            <div class="card-body">
              <h6 class="card-title">${item.title}</h5>
              <div id = "genres-tag">${displayGenresTag(item.genres)}</div>
            </div>
            
            <!-- "More" button -->
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
              <!-- favorite button -->
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
        `
      )).join('')

    }
  }

  function showMovie(id) {
    // get elements
    const modalTitle = document.getElementById('show-movie-title')
    const modalImage = document.getElementById('show-movie-image')
    const modalDate = document.getElementById('show-movie-date')
    const modalDescription = document.getElementById('show-movie-description')

    // set request url
    const url = INDEX_URL + id
    console.log(url)

    // send request to show api
    axios.get(url).then(response => {
      const data = response.data.results
      // insert data into modal ui
      modalTitle.textContent = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL}${data.image}" class="img-fluid" alt="Responsive image">`
      modalDate.textContent = `release at : ${data.release_date}`
      modalDescription.textContent = `${data.description}`
      console.log(data.genres)
    })
  }

  function addFavoriteItem(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(movie.title + ' is already in your favorite list.')
    } else {
      list.push(movie)
      alert('Added ' + movie.title + ' to your favorite list!')
    }
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }

  function getTotalPages(data) {
    let totalPages = Math.ceil(data.length / ITEM_PER_PAGE) || 1
    let pageItemContent = ''
    for (let i = 0; i < totalPages; i++) {
      pageItemContent += `
        <li class="page-item">
          <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
        </li>
      `
    }
    pagination.innerHTML = pageItemContent
  }

  function getPageData(pageNum, data, pattern) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayDataList(pageData, pattern)
  }


  function displayGenresList(genres) {
    for (let key in genres) {
      genresPanel.innerHTML +=
        `
      <li class="list-group-item list-group-item-action" data-id = ${key}>${genres[key]}</li>
      `
    }
  }

  function displayGenresTag(Genres) {
    return Genres.map(item => (
      `<span class="badge badge-pill badge-light font-weight-light">${genres[item]}</span>`
    )).join('')
  }

  function removeActiveListItem() {
    const li = document.getElementsByClassName('list-group-item')
    for (let i = 0; i < li.length; i++) {
      li[i].classList.remove('active')
    }
  }

  axios.get(INDEX_URL).then((response) => {
    data.push(...response.data.results)
    getTotalPages(data)
    getPageData(1, data)
    displayGenresList(genres)
  }).catch((err) => console.log(err))

  // SKIP (accessing data by axios)

  // listen to data panel
  dataPanel.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      console.log(event.target.dataset.id)
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to the table
  table.addEventListener('click', (event) => {
    if (event.target.matches('.btn-show-movie')) {
      showMovie(event.target.dataset.id)
    } else if (event.target.matches('.btn-add-favorite')) {
      console.log(event.target.dataset.id)
      addFavoriteItem(event.target.dataset.id)
    }
  })

  // listen to search btn click event
  searchBtn.addEventListener('click', event => {
    event.preventDefault()
    const regex = new RegExp(searchInput.value, 'i')
    results = data.filter(movie => movie.title.match(regex))
    getTotalPages(results)
    getPageData(pageLink, results, pattern)
    console.log(pageLink)
  })

  // listen to pagination click event
  pagination.addEventListener('click', event => {
    pageLink = event.target.dataset.page
    if (event.target.tagName === 'A') {
      getPageData(pageLink, data, pattern)
    }
    console.log(pageLink)
  })

  // listen to view-pattern click event
  viewPattern.addEventListener('click', event => {
    // pattern 對應HTML icon的id
    pattern = event.target.dataset.id
    // 判斷如果有搜尋且要切換成list, 以搜尋結果results取代data
    if (results.length > 0) {
      let data = results
      getTotalPages(data)
      getPageData(pageLink, data, pattern)
    }
    // 若沒有搜尋, 渲染全部data
    else {
      getTotalPages(data)
      getPageData(pageLink, data, pattern)
    }
    // 切換標示現在的pattern
    if (pattern === "card-pattern") {
      list.classList.remove('hover-color')
      card.classList.add('hover-color')
    } else {
      list.classList.add('hover-color')
      card.classList.remove('hover-color')
    }
  })

  // listen to genresPanel
  genresPanel.addEventListener('click', event => {

    let clickedGenres = parseInt(event.target.dataset.id, 10)

    // if genres沒有被點選, 則篩選出同genres電影
    if (!event.target.classList.contains('active')) {
      results = data.filter(movie => movie.genres.includes(clickedGenres))
      getTotalPages(results)
      getPageData(pageLink, results, pattern)
      removeActiveListItem()
      event.target.classList.add('active')
    }
    // 再點選已經被選取的genres, 清除刪選
    else {
      removeActiveListItem()
      getTotalPages(data)
      getPageData(1, data)
    }

  })
})()