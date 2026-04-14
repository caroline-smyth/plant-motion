import Header from "../../components/Header";

export default function List() {
    return (
        <div>
            <Header/>
            <p className="text-4xl mb-4 font-garamond">
                Beautiful things I've seen recently
            </p>
            <ul className="list-disc pl-5 leading-relaxed">
                <li>
                    Afternoon light falling at an angle on Riverside Church
                </li>
                <li>
                    Shower/bathroom storage
                </li>
                <li>
                    Thin drinking glasses
                </li>
                <li>
                    The very blue hour that gives yellow lights a rich buttery color
                </li>
                <li>
                    A handwritten notebook 
                </li>
                <li>
                    Randomness generally 
                </li>
                <li>
                    Chalk hopscotch on the street
                </li>
                <li>
                    Math whiteboards that push up and down
                </li>
                <li>
                    Pleats
                </li>
                <li>
                    Dimpl like fidget toys
                </li>
                <li>
                    Birds flying in different arrangements
                </li>
                <li>
                    The way snow turns objects into gestures at themselves
                </li>
            </ul>
            
        </div>
    );
}