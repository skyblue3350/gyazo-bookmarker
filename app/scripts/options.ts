// Enable chromereload by uncommenting this line:
// import 'chromereload/devonly'
import 'semantic-ui-css/semantic.min.css'
import {changePage, getImageIdFromThumbnail, GYAZO_URL, isGyazoImageURL, saveImage, deleteEvent, setupPager} from './utils'

const setup_tab_event = (() => {
    const tab_labels = document.querySelectorAll('.tabular > .item');
    const tab_items = document.querySelectorAll('.tab');
    
    for (let i=0; i < tab_labels.length; i++) {
        tab_labels[i].addEventListener('click', (event) => {
            const target = <HTMLElement>event.currentTarget
            const target_tab = target.dataset.target
            
            for (let i=0; i < tab_labels.length; i++) {
                tab_labels[i].classList.remove('active')
                tab_items[i].classList.remove('active')
                if (target_tab == (<HTMLElement>tab_labels[i]).dataset.target) {
                    tab_labels[i].classList.add('active')
                }
                if (target_tab == tab_items[i].id) {
                    tab_items[i].classList.add('active')
                }
            }
        })
    }
})()

const setupAllDeleteButton = ((target_id: string) => {
    document.getElementById(target_id)!.addEventListener('click', (event) => {
        if (confirm('すべてのデータを削除します\nよろしいですか？')){
            chrome.storage.local.set({urls: []}, () => {
                location.reload()
            })
        }
    })
})('buttonDeleteAll')

const setupImportData = ((target_button_id: string, target_textarea_id: string)=> {
    document.getElementById(target_button_id)!.addEventListener('click', async (event) => {
        const textarea = document.getElementById(target_textarea_id) as HTMLInputElement
        const data = JSON.parse(textarea.value)
        let count = 0;
        for (var i in data) {
            if (isGyazoImageURL(data[i])) {
                // for v1
                if (await saveImage(data[i])) {
                    count++
                }
            } else {
                // for v2
                var url = GYAZO_URL + getImageIdFromThumbnail(data[i])
                if (isGyazoImageURL(url)){
                    if (await saveImage(url)) {
                        count++
                    }
                }
            }
        }
        alert(count + '件インポートしました')
    })
})('buttonImportData', 'textareaImportData')

const setupExportData = ((target_button_id: string, target_textarea_id: string)=> {
    document.getElementById(target_button_id)!.addEventListener('click', (event) => {
        chrome.storage.local.get('urls', (value) => {
            document.getElementById(target_textarea_id)!.textContent = JSON.stringify(value.urls)
        })
    })
})('buttonExportData', 'textareaExportData')

const changeViewCount = (() => {
    chrome.storage.sync.get("viewCount", (value) => {
        const target = <HTMLInputElement>document.getElementById('viewCount')!
        if (value.viewCount == undefined) {
            target.value = '20'
            chrome.storage.sync.set({viewCount: target.value})
        } else {
            target.value = value.viewCount.toString()
        }
        
    })

    document.getElementById('viewCount')!.addEventListener('change', (event) => {
        const target = <HTMLInputElement>event.target
        chrome.storage.sync.set({viewCount: target.value})
        
    })
})()

const setupMigrationData = (() => {
    document.getElementById('buttonMigrate')!.addEventListener('click', async () => {
        if (confirm('v1からデータをインポートします\nよろしいですか')) {
            let count = 0
            if (localStorage.url == undefined) {
                alert('v1のデータが見つかりませんでした')
            } else {
                const data = JSON.parse(localStorage.url)
                for(var i=0; i<data.length; i++){
                    if (isGyazoImageURL(data[i])) {
                        if (await saveImage(data[i])) {
                            count++
                        }
                    }
                }
                alert(count + '件のデータをインポートしました')
            }
        }
    })

    document.getElementById('buttonDeleteV1')!.addEventListener('click', () => {
        if (confirm('v1のデータを削除します\nよろしいですか')) {
            localStorage.removeItem('url')
        }
    })
})()

setupPager()
changePage(parseInt(document.getElementById('page')!.dataset.page!))
deleteEvent('ui')