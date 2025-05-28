import Image from '@tiptap/extension-image'
import { Plugin } from 'prosemirror-state'

const CustomImage = Image.extend({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handleDOMEvents: {
            drop: (view, event) => {
              const hasFiles = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length
              if (!hasFiles) return false

              const images = Array.from(event.dataTransfer.files).filter(file => /image/i.test(file.type))
              if (images.length === 0) return false

              event.preventDefault()

              const { schema } = view.state
              const coordinates = view.posAtCoords({
                left: event.clientX,
                top: event.clientY,
              })

              images.forEach(image => {
                const reader = new FileReader()
                reader.onload = readerEvent => {
                  const node = schema.nodes.image.create({
                    src: readerEvent.target.result,
                  })
                  const pos = coordinates ? coordinates.pos : view.state.selection.from
                  const transaction = view.state.tr.insert(pos, node)
                  view.dispatch(transaction)
                }
                reader.readAsDataURL(image)
              })
              return true
            },
            paste: (view, event) => {
                const clipboardData = event.clipboardData;
                if (!clipboardData) return false;

                // Se tem conteúdo HTML, deixa o editor lidar com o conteúdo misto (texto+imagem)
                const htmlData = clipboardData.getData('text/html');
                if (htmlData && htmlData.length > 0) {
                    // deixa o editor processar o HTML com texto + imagens inline
                    return false;
                }

                // Se não tem html, mas tem arquivos de imagem (ex: só imagem no clipboard)
                const images = Array.from(clipboardData.files || []).filter(file => /image/i.test(file.type));
                if (images.length === 0) return false;

                event.preventDefault();

                const { schema } = view.state;

                images.forEach(image => {
                    const reader = new FileReader();
                    reader.onload = readerEvent => {
                    const node = schema.nodes.image.create({
                        src: readerEvent.target.result,
                    });
                    const transaction = view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                    };
                    reader.readAsDataURL(image);
                });

                return true;
            },
          },
        },
      }),
    ]
  },
})

export default CustomImage