const readline = require('readline')
const Xray = require('x-ray')
const x = Xray()
const async = require('async')
const fs = require('fs')
const slug = require('slug')
const cloudinary = require('cloudinary')
var shell = require('shelljs')
var clear = require('clear')
require('dotenv').config()
const rl = readline.createInterface(process.stdin, process.stdout)
const album = {}
const credits = []

// Cloudinary settings, read secrets
cloudinary.config({
	cloud_name: process.env.CLOUDNAME,
	api_key: process.env.APIKEY,
	api_secret: process.env.APISECRET
})

async.series([
	// Get user input
	(readInput = step => {
		clear()
		rl.setPrompt('Enter album title: ')
		rl.prompt()

		rl
			.on('line', line => {
				album.title = line
				rl.close()
			})
			.on('close', () => {
				step()
			})
	}),
	// Get album link on allmusic.com
	(getAlbum = step => {
		x(
			'http://www.allmusic.com/search/all/' +
				encodeURIComponent(album.title) +
				'',
			{
				items: x('.search-results', [
					{
						album: x('.album', [
							{
								link: '.title a@href'
							}
						])
					}
				])
			}
		)(function(err, obj) {
			album.link = obj.items[0].album[0].link
			console.log('✔ Found results from allmusic.com')
			step()
		})
	}),
	// Get credits and data
	(getCredits = step => {
		x(album.link + '/credits', {
			album: x('hgroup', [
				{
					artist: 'h2.album-artist',
					title: 'h1.album-title'
				}
			]),
			links: x('.partner-buttons', [
				{
					spotify: '.spotify@href'
				}
			]),
			release: x('.release-date', [
				{
					date: 'span'
				}
			]),
			cover: x('.album-contain', [
				{
					image: '.media-gallery-image@src'
				}
			]),
			items: x('.credits table', [
				{
					credits: x('tr', [
						{
							musician: 'td.artist',
							credit: 'td.credit'
						}
					])
				}
			])
		})(function(err, obj) {
			if (obj.release[0] !== undefined)
				album.release = obj.release[0].date.match(/(?:(?:19|20)[0-9]{2})/)[0]

			if (obj.links[0] !== undefined) album.spotify = obj.links[0].spotify

			if (obj.album[0] !== undefined) album.info = obj.album[0]

			if (obj.cover[0] !== undefined) album.art = obj.cover[0].image

			if (obj.items[0] !== undefined) album.credits = obj.items[0].credits

			console.log('✔ Saved credits and album info')

			step()
		})
	}),
	// Do some cleanup, only extract musicians
	(cleanUp = step => {
		for (var i = 0, l = album.credits.length; i < l; i++) {
			var artist = album.credits[i].musician.trim().replace('\n', '')
			var credit = album.credits[i].credit
				.trim()
				.replace('Drums', 'Trummor')
				.replace('Bass', 'Bas')
				.replace('Electric', 'El')
				.replace('Saxophone', 'Saxofon')
				.replace('Guitar', 'Gitarr')

			if (
				!credit.match(
					/producer|packaging|photo|art|liner|mastering|mixing|a&r|assistant|remixing|director|engineer|lettering|marketing|readings|graphic|management|design|reissue/gi
				)
			) {
				credits.push({
					musician: artist,
					instrument: credit
						.replace('Main Personnel', '')
						.replace(',', '')
						.replace(' ', ', ')
						.trim()
				})
			}
		}

		step()
	}),
	// Upload cover art to Cloudinary
	(uploadImage = step => {
		cloudinary.uploader.upload(album.art, function(result) {
			album.art = result.secure_url
			console.log('✔ Uploaded cover art to Cloudinary')
			step()
		})
	}),
	// Save markdown
	(saveMarkdown = step => {
		var creditstring = ''

		for (var i = 0; i < credits.length; i++) {
			creditstring +=
				'\n' +
				'- { name: "' +
				credits[i]['musician'] +
				'", instrument: "' +
				credits[i]['instrument'] +
				'"}'
		}

		const jekylldata = {
			title: album.info.title.trim().replace('\n', ''),
			artist: album.info.artist.trim().replace('\n', ''),
			label: '',
			year: album.release,
			tags: '',
			image: album.art,
			permalink:
				'/' +
				slug(album.info.title.trim().replace('\n', ''), {
					lower: true
				}) +
				'/',
			spotify: album.spotify !== 'undefined' ? album.spotify : '',
			credits: creditstring
		}

		const filename =
			new Date().toJSON().slice(0, 10) +
			'-' +
			slug(album.info.title, {
				lower: true
			}) +
			'.md'

		// Prepare Markdown
		const markdown =
			'---\nlayout: post\ntitle: ' +
			jekylldata.title +
			'\nartist: ' +
			jekylldata.artist +
			'\nlabel: ' +
			jekylldata.label +
			'\nyear: ' +
			jekylldata.year +
			'\ntags: ' +
			jekylldata.tags +
			'\nimage: ' +
			jekylldata.image +
			'\npermalink: ' +
			jekylldata.permalink +
			'\nspotify: ' +
			jekylldata.spotify +
			'\ncredits: ' +
			jekylldata.credits +
			'\n\n---\n\n'

		// Save as Markdown file
		fs.writeFile('_posts/' + filename, markdown, function(err) {
			if (err) {
				return console.log(err)
			}

			console.log(`✔ Saved Markdown file in ./_posts/${filename}`)

			shell.exec(`code . _posts/${filename}`)
			console.log('✔ Opened Markdown file in editor')

			process.exit()
		})
	})
])
