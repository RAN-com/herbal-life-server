type ListItems = {
  content: string
  items: ListItems[]
}

type ListData = {
  items: ListItems[]
  style: 'unordered' | 'ordered'
}

type ListRendererProps = {
  data: ListData
}

export const ListRenderer: React.FC<ListRendererProps> = ({ data }) => {
  const renderItem = (item: ListItems, index: number) => {
    if (item.items) {
      // Render nested list if it exists
      return (
        <li key={index}>
          {item.content}
          <ul
            style={{
              marginLeft: '1rem'
            }}
          >
            {item.items.map((subItem, subIndex) => renderItem(subItem, subIndex))}
          </ul>
        </li>
      )
    } else {
      // Render regular list item
      return <li key={index}>{item.content}</li>
    }
  }

  if (data.style === 'unordered') {
    return <ul>{data.items.map(renderItem)}</ul>
  } else if (data.style === 'ordered') {
    return <ol>{data.items.map(renderItem)}</ol>
  } else {
    // For any other list style, just render the items as plain text
    return (
      <ul>
        {data.items.map((item, index) => (
          <li key={index}>{item.content}</li>
        ))}
      </ul>
    )
  }
}

const LinkContainer = styled('div')({
  width: 'calc(100% - 24px)',
  height: 'max-content',
  padding: '12px 2rem',
  position: 'relative',
  top: 0,
  textAlign: 'center',
  backgroundColor: '#EFF9FD',
  a: {
    textAlign: 'center',
    textDecoration: 'none',
    color: 'inherit'
  },
  'a::after': {
    content: '""',
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0
  }
})

export const LinkRenderer = (e: any) => {
  console.log(e)
  return (
    <LinkContainer>
      <a href={e.data.link}>{e.data.link}</a>
    </LinkContainer>
  )
}

import { OutputData } from '@editorjs/editorjs'
import { styled } from '@mui/material'
import Output from 'editorjs-react-renderer'

type Props = {
  data: OutputData
}
const Renderer = ({ data }: Props) => {
  return (
    <Output
      data={data}
      renderers={{
        list: ListRenderer,
        link: LinkRenderer // Add the LinkRenderer here
      }}
      config={{
        header: {
          disableDefaultStyle: true
        },
        video: {
          disableDefaultStyle: true
        }
      }}
    />
  )
}

export default Renderer
