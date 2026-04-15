import Card from "../../../components/Card";

export default function CardPage() {
  return (
    <div className="flex justify-center pt-12">
      <Card image="/morisot.jpg" painter="Morisot" title="The Cradle" year={1872} medium="Oil on canvas" 
      notes="Relationship between mother and child is somewhat ambiguous and not Madonna-like; modern representation of motherhood" />
    </div>
  );
}
