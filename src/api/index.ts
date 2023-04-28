import type { AxiosProgressEvent, GenericAbortSignal } from 'axios'
import { post } from '@/utils/request'
import { useAuthStore, useSettingStore } from '@/store'

export function fetchChatAPI<T = any>(
  prompt: string,
  options?: { conversationId?: string; parentMessageId?: string },
  signal?: GenericAbortSignal,
) {
  return post<T>({
    url: '/chat',
    data: { prompt, options },
    signal,
  })
}

export function fetchChatConfig<T = any>() {
  return post<T>({
    url: '/config',
  })
}

export function fetchChatAPIProcess<T = any>(
  params: {
    prompt: string
    options?: { conversationId?: string; parentMessageId?: string }
    signal?: GenericAbortSignal
    onDownloadProgress?: (progressEvent: AxiosProgressEvent) => void },
) {
  const settingStore = useSettingStore()
  const authStore = useAuthStore()

  let data: Record<string, any> = {
    model: "gpt-3.5-turbo",
		messages: [{"role": "user", "content": params.prompt} ],
		temperature: 0.7
  }

  if (authStore.isChatGPTAPI) {
    data = {
      ...data,
      systemMessage: settingStore.systemMessage,
      temperature: settingStore.temperature,
      top_p: settingStore.top_p,
    }
  }


let url: string = "";
if(params.prompt.slice(0,6) === "自有知识库："){
  url = `/chat/queryaction?type=0&query=${params.prompt}`
  params.prompt = params.prompt.slice(6)
  data.messages[0].content = data.messages[0].content.slice(6)
}else if(params.prompt.slice(0,6) === "外部API："){
  url = `/chat/queryaction?type=1&query=${params.prompt}`
  params.prompt = params.prompt.slice(6)
  data.messages[0].content = data.messages[0].content.slice(6)
}else if(params.prompt.slice(0,5) === "默认AI："){
  params.prompt = params.prompt.slice(5)
  data.messages[0].content = data.messages[0].content.slice(5)
  url = '/v1/chat/completions'
} else if(params.prompt.slice(0,2) === ("天气")){
  url = `/api?unescape=1&version=v1&appid=85841439&appsecret=EKCDLT4I`
} else {
	url = '/v1/chat/completions'
}

//chatgpt key 
let headers: string = "";

return post<T>({
  url: url,
  headers: { 'Authorization': `Bearer ${headers}` },
  data,
  signal: params.signal,
  onDownloadProgress: params.onDownloadProgress,
})
}



export function fetchSession<T>() {
  return post<T>({
    url: '/session',
  })
}

export function fetchVerify<T>(token: string) {
  return post<T>({
    url: '/verify',
    data: { token },
  })
}
