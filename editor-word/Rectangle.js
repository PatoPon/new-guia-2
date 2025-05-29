const { Node, mergeAttributes } = require('@tiptap/core')

module.exports = Node.create({
  name: 'rectangleShape',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      x: { default: 100 },
      y: { default: 100 },
      width: { default: 120 },
      height: { default: 80 },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-rectangle-shape]' }]
  },

  renderHTML({ HTMLAttributes }) {
    const { x, y, width, height } = HTMLAttributes
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-rectangle-shape': 'true',
        style: `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: ${width}px;
          height: ${height}px;
          background-color: #e2e8f0;
          border: 2px solid #4a5568;
          cursor: pointer;
        `,
      }),
    ]
  },

  addNodeView() {
    return ({ node, getPos, editor }) => {
      const dom = document.createElement('div')
      dom.setAttribute('data-rectangle-shape', 'true')
      dom.style.position = 'absolute'
      dom.style.backgroundColor = '#e2e8f0'
      dom.style.border = '2px solid #4a5568'
      dom.style.cursor = 'pointer'
      dom.style.left = `${node.attrs.x}px`
      dom.style.top = `${node.attrs.y}px`
      dom.style.width = `${node.attrs.width}px`
      dom.style.height = `${node.attrs.height}px`

      // Handle de resize
      const resizeHandle = document.createElement('div')
      resizeHandle.style.position = 'absolute'
      resizeHandle.style.right = '0'
      resizeHandle.style.bottom = '0'
      resizeHandle.style.width = '12px'
      resizeHandle.style.height = '12px'
      resizeHandle.style.backgroundColor = '#4a5568'
      resizeHandle.style.cursor = 'se-resize'
      resizeHandle.style.borderRadius = '2px'
      dom.appendChild(resizeHandle)

      // Drag logic
      let isDragging = false
      let isResizing = false

      const onMouseMove = (e) => {
        if (isDragging) {
          dom.style.left = `${e.clientX - node.attrs.width / 2}px`
          dom.style.top = `${e.clientY - node.attrs.height / 2}px`
        }

        if (isResizing) {
          const newWidth = Math.max(40, e.clientX - dom.getBoundingClientRect().left)
          const newHeight = Math.max(30, e.clientY - dom.getBoundingClientRect().top)
          dom.style.width = `${newWidth}px`
          dom.style.height = `${newHeight}px`
        }
      }

      const onClick = (e) => {
        if (e.target === resizeHandle) return
        isDragging = !isDragging
        dom.style.borderColor = isDragging ? '#3182ce' : '#4a5568'

        if (!isDragging) {
          savePosition()
        }
      }

      const savePosition = () => {
        editor.commands.command(({ tr }) => {
          tr.setNodeMarkup(getPos(), undefined, {
            ...node.attrs,
            x: parseInt(dom.style.left),
            y: parseInt(dom.style.top),
            width: parseInt(dom.style.width),
            height: parseInt(dom.style.height),
          })
          return true
        })
      }

      resizeHandle.addEventListener('mousedown', () => {
        isResizing = true
      })

      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', () => {
        if (isResizing) {
          isResizing = false
          savePosition()
        }
      })

      dom.addEventListener('click', onClick)

      return {
        dom,
        contentDOM: null,
        destroy() {
          document.removeEventListener('mousemove', onMouseMove)
        },
      }
    }
  },
})
