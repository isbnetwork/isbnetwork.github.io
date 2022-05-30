

export function convertSnaps<T>(results)  {
    return <T[]> results.docs.map(snap => {
        return {
            id: snap.id,
            ...<any>snap.data()
        }
    })

}
export function removeAccents(str): string {
  const AccentsMap = [
    "aàảãáạăằẳẵắặâầẩẫấậ",
    "AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ",
    "dđ", "DĐ",
    "eèẻẽéẹêềểễếệ",
    "EÈẺẼÉẸÊỀỂỄẾỆ",
    "iìỉĩíị",
    "IÌỈĨÍỊ",
    "oòỏõóọôồổỗốộơờởỡớợ",
    "OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ",
    "uùủũúụưừửữứự",
    "UÙỦŨÚỤƯỪỬỮỨỰ",
    "yỳỷỹýỵ",
    "YỲỶỸÝỴ"
  ];
  for (let i=0; i<AccentsMap.length; i++) {
    let  re = new RegExp('[' + AccentsMap[i].substr(1) + ']', 'g');
    let char = AccentsMap[i][0];
    str = str.replace(re, char);
  }
  return str;
}

export function base64ToFile(data, filename) {
  const arr = data.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}
export function dateToStr(date?: Date): string {
  const temp = date || new Date();
  const day =  String(temp.getDate()).padStart(2, '0') ;
  const month =   String(temp.getMonth() + 1).padStart(2, '0') ;
  const year = temp.getFullYear();
  return  `${day}-${month}-${year}`
}
function setKeyByDate (num: number)  {
  let d = new Date();
  d.setHours(0);
  d.setMinutes(0);
  d.setDate(d.getDate()-num);
 return d;
}

export function  range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}
