import lunr from 'lunr'

const searchfield = document.querySelector('.form-input')
const resultdiv = document.querySelector('.albumcontainer')
const searchcount = document.querySelector('.searchcount')
let timeoutId

const searchLoader = document.querySelector('.form-icon')

let index = lunr(function () {
	this.ref('id')
	this.field('name', { boost: 10 })
	this.field('author')
	this.field('link')
	this.field('install_id')
	this.field('type')
	this.field('tags')
	this.field('image')
})

for (let key in window.store) {
	index.add({
		id: key,
		name: window.store[key].name,
		author: window.store[key].author,
		link: window.store[key].link,
		install_id: window.store[key].install_id,
		type: window.store[key].type,
		tags: window.store[key].tags,
		image: window.store[key].image,
	})
}

const runServiceWorker = () => {
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', function () {
			navigator.serviceWorker.register('/serviceworker.js')
		})
	}
}

const getTerm = function () {
	if (searchfield) {
		searchfield.addEventListener('keyup', function (event) {
			event.preventDefault()
			searchLoader.style.opacity = 1
			const query = this.value

			doSearch(query)
		})
	}
}

const getQuery = () => {
	const parser = document.createElement('a')
	parser.href = window.location.href

	if (parser.href.includes('=')) {
		const searchquery = decodeURIComponent(
			parser.href.substring(parser.href.indexOf('=') + 1)
		)
		searchfield.setAttribute('value', searchquery)

		doSearch(searchquery)
	}
}

const updateUrlParameter = value => {
	window.history.pushState('', '', `?s=${encodeURIComponent(value)}`)
}

const doSearch = query => {
	const result = index.search(query)
	resultdiv.innerHTML = ''
	searchcount.innerHTML = `Found ${result.length} result`

	setTimeout(() => {
		searchLoader.style.opacity = 0
	}, 500)

	updateUrlParameter(query)
	showResults(result)
}

const showResults = result => {
	clearTimeout(timeoutId)
	timeoutId = setTimeout(function () {
		for (let item of result) {
			const ref = item.ref

			const searchitem = document.createElement('div')

			searchitem.className = 'column col-4 col-sm-12 col-md-6 mb2'
			searchitem.innerHTML = `<a class='card-link' href='${
				window.store[ref].link
				}'><div class='cover'><img class='img-responsive' src='${
				window.store[ref].image
				}' src='${window.store[ref].image}' alt='${
				window.store[ref].title
				}'/></div><div class='card-header'><h4 class='card-title'>${
				window.store[ref].name
				}</h4><h6 class='card-meta'>${
				window.store[ref].author
				}</h6></div></a>`

			resultdiv.appendChild(searchitem)

			/*
			setTimeout(() => {
				bLazy.revalidate()
			}, 300)
			*/
		}
	}, 300)
}

runServiceWorker()
getTerm()
getQuery()
