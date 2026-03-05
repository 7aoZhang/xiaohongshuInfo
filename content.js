;(function () {
  if (window.top !== window.self) return
  if (document.getElementById('xhs-floating-ball')) return
  function ready(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      fn()
    } else {
      document.addEventListener('DOMContentLoaded', fn, { once: true })
    }
  }
  ready(function () {
    if (document.getElementById('xhs-floating-ball')) return
    var ball = document.createElement('div')
    ball.id = 'xhs-floating-ball'
    ball.style.position = 'fixed'
    ball.style.right = '16px'
    ball.style.top = '40%'
    ball.style.width = '48px'
    ball.style.height = '48px'
    ball.style.borderRadius = '50%'
    ball.style.background = 'rgba(135,206,235,0.9)'
    ball.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
    ball.style.zIndex = '2147483647'
    ball.style.cursor = 'pointer'
    ball.style.display = 'flex'
    ball.style.alignItems = 'center'
    ball.style.justifyContent = 'center'
    ball.style.userSelect = 'none'
    ball.style.transition = 'transform .2s ease, opacity .2s ease'
    ball.style.opacity = '0.95'
    ball.setAttribute('aria-label', 'XHS')
    var dot = document.createElement('div')
    dot.style.width = '8px'
    dot.style.height = '8px'
    dot.style.borderRadius = '50%'
    dot.style.background = 'white'
    dot.style.opacity = '0.9'
    ball.appendChild(dot)
    ball.addEventListener('mouseenter', function () {
      ball.style.transform = 'scale(1.06)'
      ball.style.opacity = '1'
    })
    ball.addEventListener('mouseleave', function () {
      ball.style.transform = 'scale(1)'
      ball.style.opacity = '0.95'
    })
    function visible(el) {
      if (!el || !el.ownerDocument || !el.getClientRects) return false
      var rect = el.getClientRects()[0]
      if (!rect) return false
      var style = window.getComputedStyle(el)
      return style && style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0
    }
    function extractNumber(s) {
      if (!s) return null
      var m = s.replace(/\s+/g, '').match(/(\d[\d,\.万Ww]*)/)
      if (!m) return null
      var v = m[1]
      if (/万|W|w/.test(v)) {
        var n = parseFloat(v.replace(/[^\d\.]/g, '') || '0')
        return Math.round(n * 10000)
      }
      return parseInt(v.replace(/[^\d]/g, ''), 10)
    }
    function findLabeledValue(labels) {
      var nodes = Array.prototype.slice.call(document.querySelectorAll('span,div,p,li,dt,dd,a'))
      var found = null
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        if (!visible(n)) continue
        var t = (n.textContent || '').trim()
        if (!t) continue
        for (var j = 0; j < labels.length; j++) {
          var lb = labels[j]
          if (t.indexOf(lb) !== -1) {
            var own = t.replace(/\s+/g, '')
            var after = own.split(lb).slice(1).join(lb)
            var num = extractNumber(after)
            if (num != null) return num
            var prev = n.previousElementSibling
            if (prev && visible(prev)) {
              var pn = extractNumber(prev.textContent || '')
              if (pn != null) return pn
            }
            var next = n.nextElementSibling
            if (next && visible(next)) {
              var nn = extractNumber(next.textContent || '')
              if (nn != null) return nn
            }
            var parent = n.parentElement
            if (parent && visible(parent)) {
              var children = Array.prototype.slice.call(parent.children)
              for (var k = 0; k < children.length; k++) {
                var c = children[k]
                if (c === n) continue
                if (!visible(c)) continue
                var cn = extractNumber(c.textContent || '')
                if (cn != null) return cn
              }
            }
          }
        }
      }
      return found
    }
    function findMetricByPattern(pattern) {
      var nodes = Array.prototype.slice.call(document.querySelectorAll('span,div,p,li,dt,dd,a'))
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        if (!visible(n)) continue
        var t = (n.textContent || '').trim()
        if (t) {
          var m = t.match(pattern)
          if (m && m[1]) {
            var num = extractNumber(m[1])
            if (num != null) return num
          }
        }
        var prev = n.previousElementSibling
        if (prev && visible(prev)) {
          var tp = ((prev.textContent || '') + ' ' + t).trim()
          var mp = tp.match(pattern)
          if (mp && mp[1]) {
            var nump = extractNumber(mp[1])
            if (nump != null) return nump
          }
        }
        var next = n.nextElementSibling
        if (next && visible(next)) {
          var tn = (t + ' ' + (next.textContent || '')).trim()
          var mn = tn.match(pattern)
          if (mn && mn[1]) {
            var numn = extractNumber(mn[1])
            if (numn != null) return numn
          }
        }
      }
      return null
    }
    function textOf(el) {
      if (!el) return ''
      return (el.innerText || el.textContent || '').trim()
    }
    function findInteractionStats() {
      var result = { following: null, followers: null, likesFavs: null }
      var items = Array.prototype.slice.call(document.querySelectorAll('.user-interactions > div'))
      for (var i = 0; i < items.length; i++) {
        var item = items[i]
        if (!visible(item)) continue
        var label = textOf(item.querySelector('.shows'))
        var count = extractNumber(textOf(item.querySelector('.count')))
        if (count == null) count = extractNumber(textOf(item))
        if (!label || count == null) continue
        if (label.indexOf('关注') !== -1) result.following = count
        if (label.indexOf('粉丝') !== -1) result.followers = count
        if (label.indexOf('获赞与收藏') !== -1 || label.indexOf('获赞') !== -1 || label.indexOf('收藏') !== -1) result.likesFavs = count
      }
      return result
    }
    function findId() {
      var redIdEl = document.querySelector('.user-redId')
      var redIdText = textOf(redIdEl)
      if (redIdText) {
        var m0 = redIdText.match(/小红书号[:：]\s*([A-Za-z0-9._-]{3,})/)
        if (m0 && m0[1]) return m0[1]
      }
      var nodes = Array.prototype.slice.call(document.querySelectorAll('span,div,p,li,dt,dd,a'))
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        if (!visible(n)) continue
        var txt = textOf(n)
        if (!txt) continue
        var m = txt.match(/小红书号[:：]\s*([A-Za-z0-9._-]{3,})/)
        if (m && m[1]) return m[1]
      }
      return null
    }
    function findNickname() {
      var userNameEl = document.querySelector('.user-name')
      var userName = textOf(userNameEl)
      if (userName) return userName
      var nodes = Array.prototype.slice.call(document.querySelectorAll('.user-nickname .user-name,h1,h2'))
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        if (!visible(n)) continue
        var t = textOf(n)
        if (t && t.length <= 40) return t
      }
      return null
    }
    function findIP() {
      var ipEl = document.querySelector('.user-IP')
      var ipText = textOf(ipEl)
      if (ipText) {
        var m0 = ipText.match(/IP属地[:：]\s*([^\s|｜，,。；;!！?？]+)/)
        if (m0 && m0[1]) return m0[1]
      }
      var nodes = Array.prototype.slice.call(document.querySelectorAll('span,div,p,li,dt,dd,a'))
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        if (!visible(n)) continue
        var t = textOf(n)
        if (!t) continue
        var m = t.match(/IP属地[:：]\s*([^\s|｜，,。；;!！?？]+)/)
        if (m && m[1]) return m[1]
      }
      return null
    }
    function findSignature() {
      var descEl = document.querySelector('.user-desc')
      var desc = textOf(descEl)
      if (desc) return desc
      var nodes = Array.prototype.slice.call(document.querySelectorAll('.info .user-desc, .basic-info + .user-desc, [class*="user-desc"]'))
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i]
        if (!visible(n)) continue
        var t = textOf(n)
        if (t) return t
      }
      return null
    }
    function findNotes() {
      var items = Array.prototype.slice.call(document.querySelectorAll('#userPostedFeeds .note-item'))
      var notes = []
      for (var i = 0; i < items.length; i++) {
        var item = items[i]
        if (!visible(item)) continue
        var title = textOf(item.querySelector('.footer .title'))
        var status = textOf(item.querySelector('.bottom-tag-area .bottom-wrapper'))
        var like = extractNumber(textOf(item.querySelector('.like-wrapper .count')))
        var imgEl = item.querySelector('.cover img')
        var imageUrl = ''
        if (imgEl) imageUrl = imgEl.getAttribute('src') || imgEl.src || ''
        var useEl = item.querySelector('.like-wrapper use')
        var href = ''
        if (useEl) href = useEl.getAttribute('xlink:href') || useEl.getAttribute('href') || (useEl.href && useEl.href.baseVal) || ''
        var selfLiked = href.indexOf('#liked') !== -1
        if (!title && !imageUrl) continue
        notes.push({
          index: notes.length + 1,
          title: title || null,
          status: status || null,
          like: like != null ? like : null,
          imageUrl: imageUrl || null,
          selfLiked: selfLiked
        })
      }
      return notes
    }
    function formatDatePart(n) {
      return n < 10 ? '0' + n : String(n)
    }
    function buildExportRows(data) {
      var rows = []
      rows.push(['字段', '值'])
      rows.push(['昵称', data.nickname || ''])
      rows.push(['关注', data.following != null ? data.following : ''])
      rows.push(['粉丝', data.followers != null ? data.followers : ''])
      rows.push(['获赞与收藏', data.likesFavs != null ? data.likesFavs : ''])
      rows.push(['小红书号', data.xhsId || ''])
      rows.push(['IP属地', data.ipLocation || ''])
      rows.push(['个性签名', data.signature || ''])
      rows.push([])
      rows.push(['笔记索引', '标题', '状态', '点赞数', '自己已点赞', '图片链接'])
      var notes = Array.isArray(data.notes) ? data.notes : []
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i]
        rows.push([n.index, n.title || '', n.status || '', n.like != null ? n.like : '', n.selfLiked ? '是' : '否', n.imageUrl || ''])
      }
      return rows
    }
    function escapeCsvCell(v) {
      var s = v == null ? '' : String(v)
      if (/[",\n\r]/.test(s)) return '"' + s.replace(/"/g, '""') + '"'
      return s
    }
    function rowsToCsv(rows) {
      var lines = []
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i]
        var cols = []
        for (var j = 0; j < row.length; j++) cols.push(escapeCsvCell(row[j]))
        lines.push(cols.join(','))
      }
      return '\ufeff' + lines.join('\r\n')
    }
    function escapeXml(v) {
      return String(v == null ? '' : v)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
    }
    function rowsToXlsxXml(rows) {
      var parts = []
      parts.push('<?xml version="1.0"?>')
      parts.push('<?mso-application progid="Excel.Sheet"?>')
      parts.push('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">')
      parts.push('<Worksheet ss:Name="xhs_data"><Table>')
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i]
        parts.push('<Row>')
        for (var j = 0; j < row.length; j++) {
          var cell = row[j]
          var isNumber = typeof cell === 'number' || (String(cell).match(/^-?\d+(\.\d+)?$/) && cell !== '')
          var t = isNumber ? 'Number' : 'String'
          parts.push('<Cell><Data ss:Type="' + t + '">' + escapeXml(cell) + '</Data></Cell>')
        }
        parts.push('</Row>')
      }
      parts.push('</Table></Worksheet></Workbook>')
      return parts.join('')
    }
    function escapeMd(v) {
      return String(v == null ? '' : v).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
    }
    function dataToMarkdown(payload) {
      var data = payload.data || {}
      var notes = Array.isArray(data.notes) ? data.notes : []
      var lines = []
      lines.push('# 小红书数据导出')
      lines.push('')
      lines.push('- 导出时间: ' + payload.exportedAt)
      lines.push('- 页面地址: ' + payload.pageUrl)
      lines.push('')
      lines.push('## 用户信息')
      lines.push('')
      lines.push('| 字段 | 值 |')
      lines.push('| --- | --- |')
      lines.push('| 昵称 | ' + escapeMd(data.nickname || '') + ' |')
      lines.push('| 关注 | ' + escapeMd(data.following != null ? data.following : '') + ' |')
      lines.push('| 粉丝 | ' + escapeMd(data.followers != null ? data.followers : '') + ' |')
      lines.push('| 获赞与收藏 | ' + escapeMd(data.likesFavs != null ? data.likesFavs : '') + ' |')
      lines.push('| 小红书号 | ' + escapeMd(data.xhsId || '') + ' |')
      lines.push('| IP属地 | ' + escapeMd(data.ipLocation || '') + ' |')
      lines.push('| 个性签名 | ' + escapeMd(data.signature || '') + ' |')
      lines.push('')
      lines.push('## 笔记列表')
      lines.push('')
      lines.push('| 索引 | 标题 | 状态 | 点赞数 | 自己已点赞 | 图片链接 |')
      lines.push('| --- | --- | --- | --- | --- | --- |')
      for (var i = 0; i < notes.length; i++) {
        var n = notes[i]
        lines.push(
          '| ' +
            escapeMd(n.index) +
            ' | ' +
            escapeMd(n.title || '') +
            ' | ' +
            escapeMd(n.status || '') +
            ' | ' +
            escapeMd(n.like != null ? n.like : '') +
            ' | ' +
            escapeMd(n.selfLiked ? '是' : '否') +
            ' | ' +
            escapeMd(n.imageUrl || '') +
            ' |'
        )
      }
      return lines.join('\n')
    }
    function triggerDownload(content, mimeType, fileName) {
      var blob = new Blob([content], { type: mimeType })
      var url = URL.createObjectURL(blob)
      var a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    function downloadAllData(data, format) {
      var now = new Date()
      var ts =
        now.getFullYear() +
        formatDatePart(now.getMonth() + 1) +
        formatDatePart(now.getDate()) +
        '_' +
        formatDatePart(now.getHours()) +
        formatDatePart(now.getMinutes()) +
        formatDatePart(now.getSeconds())
      var payload = {
        exportedAt: now.toISOString(),
        pageUrl: location.href,
        data: data
      }
      var rows = buildExportRows(data)
      if (format === 'csv') {
        triggerDownload(rowsToCsv(rows), 'text/csv;charset=utf-8', 'xhs_data_' + ts + '.csv')
        return
      }
      if (format === 'xlsx') {
        triggerDownload(rowsToXlsxXml(rows), 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8', 'xhs_data_' + ts + '.xlsx')
        return
      }
      if (format === 'md') {
        triggerDownload(dataToMarkdown(payload), 'text/markdown;charset=utf-8', 'xhs_data_' + ts + '.md')
        return
      }
      triggerDownload(JSON.stringify(payload, null, 2), 'application/json;charset=utf-8', 'xhs_data_' + ts + '.json')
    }
    function createModal(data, onClose) {
      var overlay = document.createElement('div')
      overlay.id = 'xhs-info-overlay'
      overlay.style.position = 'fixed'
      overlay.style.left = '0'
      overlay.style.top = '0'
      overlay.style.width = '100vw'
      overlay.style.height = '100vh'
      overlay.style.background = 'rgba(0,0,0,0.35)'
      overlay.style.backdropFilter = 'blur(1px)'
      overlay.style.zIndex = '2147483646'
      overlay.style.display = 'flex'
      overlay.style.alignItems = 'center'
      overlay.style.justifyContent = 'center'
      var card = document.createElement('div')
      card.style.minWidth = '280px'
      card.style.maxWidth = '80vw'
      card.style.background = '#fff'
      card.style.borderRadius = '12px'
      card.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)'
      card.style.padding = '16px 16px 8px'
      card.style.color = '#222'
      card.style.maxHeight = '80vh'
      card.style.overflow = 'auto'
      card.style.fontFamily = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial'
      card.style.zIndex = '2147483647'
      var title = document.createElement('div')
      title.textContent = '小红书页面信息'
      title.style.fontSize = '16px'
      title.style.fontWeight = '600'
      title.style.marginBottom = '8px'
      var row = function (label, value) {
        var r = document.createElement('div')
        r.style.display = 'flex'
        r.style.justifyContent = 'space-between'
        r.style.alignItems = 'center'
        r.style.fontSize = '14px'
        r.style.padding = '8px 0'
        var l = document.createElement('div')
        l.textContent = label
        l.style.color = '#555'
        var v = document.createElement('div')
        v.textContent = value != null && value !== '' ? String(value) : '未检测到'
        v.style.fontWeight = '600'
        r.appendChild(l)
        r.appendChild(v)
        return r
      }
      var closeBtn = document.createElement('button')
      closeBtn.textContent = '关闭'
      closeBtn.style.marginTop = '8px'
      closeBtn.style.padding = '6px 12px'
      closeBtn.style.border = '1px solid #e5e7eb'
      closeBtn.style.borderRadius = '8px'
      closeBtn.style.background = '#f8fafc'
      closeBtn.style.cursor = 'pointer'
      closeBtn.addEventListener('mouseenter', function () {
        closeBtn.style.background = '#eef2f7'
      })
      closeBtn.addEventListener('mouseleave', function () {
        closeBtn.style.background = '#f8fafc'
      })
      var downloadBtn = document.createElement('button')
      downloadBtn.textContent = '下载数据'
      downloadBtn.style.marginTop = '8px'
      downloadBtn.style.padding = '6px 12px'
      downloadBtn.style.border = '1px solid #bfdbfe'
      downloadBtn.style.borderRadius = '8px'
      downloadBtn.style.background = '#e0f2fe'
      downloadBtn.style.cursor = 'pointer'
      downloadBtn.style.marginRight = '8px'
      downloadBtn.addEventListener('mouseenter', function () {
        downloadBtn.style.background = '#bae6fd'
      })
      downloadBtn.addEventListener('mouseleave', function () {
        downloadBtn.style.background = '#e0f2fe'
      })
      var formatSelect = document.createElement('select')
      formatSelect.style.marginTop = '8px'
      formatSelect.style.padding = '6px 8px'
      formatSelect.style.border = '1px solid #cbd5e1'
      formatSelect.style.borderRadius = '8px'
      formatSelect.style.background = '#fff'
      formatSelect.style.marginRight = '8px'
      var optJson = document.createElement('option')
      optJson.value = 'json'
      optJson.textContent = 'JSON'
      var optXlsx = document.createElement('option')
      optXlsx.value = 'xlsx'
      optXlsx.textContent = 'XLSX'
      var optCsv = document.createElement('option')
      optCsv.value = 'csv'
      optCsv.textContent = 'CSV'
      var optMd = document.createElement('option')
      optMd.value = 'md'
      optMd.textContent = 'Markdown'
      formatSelect.appendChild(optJson)
      formatSelect.appendChild(optXlsx)
      formatSelect.appendChild(optCsv)
      formatSelect.appendChild(optMd)
      downloadBtn.addEventListener('click', function () {
        downloadAllData(data, formatSelect.value)
      })
      card.appendChild(title)
      card.appendChild(row('昵称', data.nickname || null))
      card.appendChild(row('关注', data.following != null ? data.following : null))
      card.appendChild(row('粉丝', data.followers != null ? data.followers : null))
      card.appendChild(row('获赞与收藏', data.likesFavs != null ? data.likesFavs : null))
      card.appendChild(row('小红书号', data.xhsId || null))
      card.appendChild(row('IP属地', data.ipLocation || null))
      card.appendChild(row('个性签名', data.signature || null))
      var notesTitle = document.createElement('div')
      notesTitle.textContent = '笔记列表'
      notesTitle.style.fontSize = '14px'
      notesTitle.style.fontWeight = '600'
      notesTitle.style.marginTop = '10px'
      notesTitle.style.marginBottom = '4px'
      card.appendChild(notesTitle)
      var notes = Array.isArray(data.notes) ? data.notes : []
      if (!notes.length) {
        card.appendChild(row('笔记数量', 0))
      } else {
        card.appendChild(row('笔记数量', notes.length))
        for (var i = 0; i < notes.length; i++) {
          var n = notes[i]
          var block = document.createElement('div')
          block.style.border = '1px solid #e5e7eb'
          block.style.borderRadius = '8px'
          block.style.padding = '8px'
          block.style.marginTop = '8px'
          block.style.fontSize = '13px'
          var line1 = document.createElement('div')
          line1.textContent = '第' + n.index + '篇：' + (n.title || '未检测到')
          var line2 = document.createElement('div')
          line2.style.marginTop = '4px'
          line2.textContent = '状态：' + (n.status || '未检测到')
          var line3 = document.createElement('div')
          line3.style.marginTop = '4px'
          line3.textContent = '点赞：' + (n.like != null ? String(n.like) : '未检测到') + ' ｜ 自己已点赞：' + (n.selfLiked ? '是' : '否')
          var line4 = document.createElement('div')
          line4.style.marginTop = '4px'
          line4.style.wordBreak = 'break-all'
          line4.textContent = '图片：' + (n.imageUrl || '未检测到')
          block.appendChild(line1)
          block.appendChild(line2)
          block.appendChild(line3)
          block.appendChild(line4)
          card.appendChild(block)
        }
      }
      var actionWrap = document.createElement('div')
      actionWrap.style.display = 'flex'
      actionWrap.style.alignItems = 'center'
      actionWrap.appendChild(formatSelect)
      actionWrap.appendChild(downloadBtn)
      actionWrap.appendChild(closeBtn)
      card.appendChild(actionWrap)
      overlay.appendChild(card)
      function close() {
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay)
        if (typeof onClose === 'function') onClose()
      }
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) close()
      })
      closeBtn.addEventListener('click', close)
      document.body.appendChild(overlay)
      return close
    }
    function gather() {
      var stats = findInteractionStats()
      var following = stats.following
      if (following == null) following = findMetricByPattern(/(\d[\d,\.万Ww]*)\s*关注/)
      if (following == null) following = findLabeledValue(['关注'])
      var followers = stats.followers
      if (followers == null) followers = findMetricByPattern(/(\d[\d,\.万Ww]*)\s*粉丝/)
      if (followers == null) followers = findLabeledValue(['粉丝'])
      var likesFavs = stats.likesFavs
      if (likesFavs == null) likesFavs = findMetricByPattern(/(\d[\d,\.万Ww]*)\s*获赞(?:与|&)?收藏/)
      if (likesFavs == null) likesFavs = findLabeledValue(['获赞与收藏', '获赞', '收藏'])
      var xhsId = findId()
      var nickname = findNickname()
      var ipLocation = findIP()
      var signature = findSignature()
      var notes = findNotes()
      return { following: following, followers: followers, likesFavs: likesFavs, xhsId: xhsId, nickname: nickname, ipLocation: ipLocation, signature: signature, notes: notes }
    }
    ball.addEventListener('click', function () {
      var closeRef = null
      ball.style.display = 'none'
      var data = gather()
      if (data.notes && data.notes.length) {
        var tableRows = []
        for (var i = 0; i < data.notes.length; i++) {
          var n = data.notes[i]
          tableRows.push({
            index: n.index,
            title: n.title || '',
            status: n.status || '',
            like: n.like != null ? n.like : '',
            selfLiked: n.selfLiked ? '是' : '否',
            imageUrl: n.imageUrl || ''
          })
        }
        console.table(tableRows)
      } else {
        console.table([])
      }
      closeRef = createModal(data, function () {
        ball.style.display = 'flex'
      })
    })
    document.body.appendChild(ball)
  })
})()
