import cheerio from "cheerio";
import Parser from "./API/Parser";
import express from "express";
import cors from 'cors'
import 'dotenv/config'

const kairekeUrl = 'https://muzmir.kz/kairat-nurtas'
const getMusicPageLinks = async (url) => {
    const html = (await Parser.getHtml(url)).data
    const $ = cheerio.load(html)
    const htmls = []
    $('.yakum', html).each(function(){
        htmls.push($(this).find('a').attr('href'))
    })
    return htmls
}
const getMusicUrls = async (baseUrl, htmlLinks) => {
    const audios = []
    for (let i = 0; i < htmlLinks.length; i++) {
        const html = (await Parser.getHtml((htmlLinks[i]))).data
        const $ = cheerio.load(html)
        const audio = {}
        audio.id = i+1
        $('.mc-right', html).each(function(){
            const name = $(this).find('h1').text()
            audio.name = name
        })
        $('audio', html).each(function(){
            const url = baseUrl+($(this).find('source').attr('src'))
            audio.url = url
        })
        audios.push(audio)
    }
    return audios
}

const audios = await getMusicUrls(kairekeUrl, await getMusicPageLinks(kairekeUrl))

const app = express()
app.use(express.json())
app.use(cors())
app.use('/', function(req,res){
    res.send(audios)
})
app.listen(process.env.PORT, ()=>{
    console.log('Kaireke backend launched.')
})