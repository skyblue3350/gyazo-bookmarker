import * as cheerio from 'cheerio'

export const GYAZO_URL = 'https://gyazo.com/'

export const loadImages = (urls: Array<string>, target_id : string) => {
    const view = document.getElementById(target_id)!
    while(view.lastChild) {
        view.removeChild(view.lastChild)
    }

    for (var i=0; i<urls.length; i++) {
        const image_id = getImageIdFromThumbnail(urls[i])
        const link = document.createElement('a')
        link.href = GYAZO_URL + image_id
        link.target = "_blank"
        const img = document.createElement('img')
        img.src = urls[i]
        img.classList.add('ui', 'image')
        img.dataset.id = image_id

        link.append(img)
        view.append(link)
    }
}

export const saveImage = async (url: string) => {
    // get ogp image
    const result = await fetch(url).then((res) => {
        return res.text()
    }).then((html) => {
        return cheerio.load(html)
    }).then( async ($) => {
        const thumbnail = $("meta[property='og:image']").attr("content")

        if (thumbnail == undefined) {
            return false
        }

        // save
        const urls:Array<string> = await new Promise((resolve, rejects) => {
            chrome.storage.local.get("urls", async (value) => {
                resolve(value.urls != undefined ? value.urls : [])
            })
        })

        if (urls.indexOf(thumbnail) == -1) {
            urls.push(thumbnail)
            try{
                await chrome.storage.local.set({urls})
                return true
            } catch (e){
                return false
            }
        } else {
            return false
        }
    })
    return result
}

export const deleteImage = (url: string) => {
    chrome.storage.local.get("urls", (value) => {
        const urls = value.urls != undefined ? value.urls : []
        chrome.storage.local.set({urls: urls.filter((n: string) => n != url)}, () => {
            location.reload()
        })
    })
}

export const getImageIdFromThumbnail = (thumbnailUrl: string) => {
    return thumbnailUrl.split('/').slice(-1)[0].split('-')[0]
}

export const isGyazoImageURL = (url: string) => {
    if ( !(url.indexOf("https://") == 0 || url.indexOf("http://") == 0)) {
        return false
    }

    const gyazo = new URL(url)

    const image_id = gyazo.pathname.slice(1)
    if ('gyazo.com' != gyazo.host || image_id.length < 10 || image_id.slice(-1) == '/') {
        return false
    } else {
        return true
    }
}

export const deleteEvent = ((target_class: string) => {
    document.addEventListener('contextmenu', (event) => {
        event.preventDefault()

        const tag = <HTMLElement>event.target
        if (tag.tagName == 'IMG' && confirm("選択した画像のURLを削除します\nよろしいですか？")) {
            deleteImage(tag.getAttribute('src')!)

        }
    })
})

export const changePage = (pageIndex: number) => {
    chrome.storage.local.get('urls', (value) => {
        chrome.storage.sync.get('viewCount', (v) => {
            const viewCount = v.viewCount == undefined ? 20 : parseInt(v.viewCount)
            const maxPageIndex = Math.ceil(value.urls.length/viewCount) - 1
            pageIndex = pageIndex < 0 ? 0 : pageIndex
            pageIndex = pageIndex > maxPageIndex ? maxPageIndex : pageIndex
    
            const data = value.urls.reverse().slice(pageIndex * viewCount, (pageIndex + 1) * viewCount)
            loadImages(data, 'gyazo_items')
    
            document.getElementById('page')!.dataset.page = pageIndex.toString()
            document.getElementById('page')!.textContent = (pageIndex + 1).toString()
        })
    })
}

export const setupPager = () => {
    const dataPage = document.getElementById('page')
    document.getElementById('back')!.addEventListener('click', (event) => {
        changePage(parseInt(dataPage!.dataset.page!) - 1)
    })
    document.getElementById('next')!.addEventListener('click', (event) => {
        changePage(parseInt(dataPage!.dataset.page!) + 1)
    })
}