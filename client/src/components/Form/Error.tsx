type ErrorProps = {
    errorMessage?: string | null
}

const Error = ({errorMessage}: ErrorProps) => {
    if (errorMessage === null) {
        return <></>
    }
    return (
        <span className="flex items-center font-medium tracking-wide text-red-500 text-xs mt-1 ml-1">{errorMessage}</span>
    )
}

export default Error