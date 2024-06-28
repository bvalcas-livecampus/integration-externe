type ItemProps =  {
    title: string,
    description: string,
    index: number

}

const Item = ({ title, description, index }: ItemProps) => {
    return (
        <div className="relative w-full">
            <div className="absolute left-[-10px] top-[3px] w-5 h-5 bg-blue-500 rounded-full text-white flex justify-center items-center font-medium">
                {index + 1}
            </div>
            <div className="ml-6">
                <h4 className="font-bold text-blue-500">{title}</h4>
                <p className="mt-2 max-w-screen-sm text-xs text-gray-500 w-25">{description}</p>
            </div>
        </div>
    )
}

const config = [
    {
        title: "Sélectionnez un point de départ",
        description: "Pour cela il suffit de cliquez sur l'endroit ou vous souhaitez commencer votre itinéraire et vous verrez apparaître un ou des marqueurs représentant les stations les plus proches de votre point de départ"
    },
    {
        title: "Sélectionner la station de départ",
        description: "Cliquez sur le marqueur de la station de votre choix pour la sélectionner comme point de départ de votre itinéraire"
    },
    {
        title: "Sélectionner un point d'arrivée",
        description: "Cliquez sur l'endroit ou vous souhaitez terminer votre itinéraire pour voir apparaître un ou des marqueurs représentant les stations les plus proches de votre point d'arrivée"
    },
    {
        title: "Sélectionner la station d'arrivée",
        description: "Cliquez sur le marqueur de la station de votre choix pour la sélectionner comme point d'arrivée de votre itinéraire"
    },
    {
        title: "Ajouter des stations intermédiaires",
        description: "Vous pouvez ajouter des stations intermédiaires entre le point de départ et le point d'arrivée en cliquant sur la carte"
    },
    {
        title: "Confirmer votre itinéraire",
        description: "Une fois que vous avez sélectionné toutes les stations de votre itinéraire, cliquez sur le bouton 'Générer l'itinéraire' pour enregistrer votre itinéraire"
    }
]

const CreateItineraryHelp = () => {
    return (
        <div className="flex items-center ml-4 bg-white">
            <div className="space-y-1 border-l-2 border-dashed">
                {config.map((item, index) => (
                    <Item key={index} title={item.title} description={item.description} index={index}/>
                ))
                }
            </div>
        </div>
    )
}

export default CreateItineraryHelp;