import GiscusComments from "../../components/GiscusComments";

export default function CommentsLayout({children}) {
    return (
        <>
            {children}
            <GiscusComments/>
        </>
    )
}