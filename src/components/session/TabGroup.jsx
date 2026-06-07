export default function TabGroup({ title, tabs }) {

return (
<div>
<h3>{title}</h3>

{tabs?.map(t => (
<div key={t.url}>
{t.title}
</div>
))}

</div>
)

}