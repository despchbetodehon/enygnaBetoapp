import { IconBrandFacebook, IconBrandGithub, IconBrandInstagram, IconBrandYoutube } from "@tabler/icons-react"
import RedeSocial from "./RedeSocial"

export default function RedesSociais() {
    return (
        <div className="flex">
            <RedeSocial icone={<IconBrandYoutube />} url="https://preeminent-sprinkles-8c1f54.netlify.app/" />
            <RedeSocial icone={<IconBrandInstagram />} url="https://preeminent-sprinkles-8c1f54.netlify.app/" />
            <RedeSocial icone={<IconBrandFacebook />} url="https://preeminent-sprinkles-8c1f54.netlify.app/" />
            <RedeSocial icone={<IconBrandGithub />} url="https://preeminent-sprinkles-8c1f54.netlify.app/" />
            
        </div>
    )
}