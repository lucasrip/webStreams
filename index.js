const APIR_URL = 'http://localhost:3005';
let counter = 0;

async function consumeApi(signal)
{
    const response = await fetch(APIR_URL,{
      signal
    })

    const reader = response.body.pipeThrough( new TextDecoderStream())
    .pipeThrough(parseNDJSON())
    // .pipeTo(new WritableStream({
    //     write(chunk)
    //     {
    //        console.log(++counter, 'chunk', chunk)
    //     }
    // }))

    return reader
}

function appendToHtml(element)
{
 
    return new WritableStream({
       write({ title, description , url_anime})
       {

        const card = `
         <article>
          <div class="text">
           <h3>[${++counter}] ${title}</h3>
           <p>${description.slice(0,100)}</p>
            <a href="${url_anime}">
              link to anime
            </a>
          </div>
         </article>
        `;

         element.innerHTML += card;

       },
       abort(reason){
         console.log('aborted**', resizeBy);
       }
    })
}

// esta funçao vai se certificar que caso dois chunks cheguem em uma unica transmissao
// converta corretamente para json

function parseNDJSON()
{
 let ndjsonBuffer = '';

 return new TransformStream({
    transform(chunk, controller)
    {
        ndjsonBuffer += chunk;
        const items = ndjsonBuffer.split('\n');
        items.slice(0, -1)
        .forEach(item => controller.enqueue(JSON.parse(item)))
        ndjsonBuffer = items[items.length -1]
    },
    flush(controller)
    {
       if(!ndjsonBuffer) return ;
       controller.enqueue(JSON.parse(ndjsonBuffer))
    }
 })
}

const [
    start,
    stop,
    cards
] = ['start', 'stop' , 'cards'].map(item => document.getElementById(item));

let abortController = new AbortController();

start.addEventListener("click", async () => { 
  const signal = abortController.signal;
  const readable = await consumeApi(signal);
  readable.pipeTo(appendToHtml(cards));

})

stop.addEventListener("click", () => {
  
  abortController.abort();
  abortController = new AbortController();
  console.log('aborting...');

})