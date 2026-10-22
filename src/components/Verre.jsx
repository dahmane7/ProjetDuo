// Panneau en verre dépoli (utilitaire `verre` de index.css)
export default function Verre({ as: Tag = 'div', className = '', ...props }) {
  return <Tag className={`verre ${className}`} {...props} />
}
