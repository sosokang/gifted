const formatTime = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [month, day].map(formatNumber).join('月')+"日";
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

module.exports = {
  formatTime: formatTime
}
