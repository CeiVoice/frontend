import menu from '../assets/menu.png'
import './top_bar.css'
import side_bar from '../assets/side-bar.png'
function Top() {

    return (
        <div className="bar">
            <button>
                <img src={side_bar} alt="side"/>
            </button>
            <button>
                <img src={menu} alt="menu" />
            </button>
            <p>CEIVoice</p>
            <button className='create_button'>
                + create
            </button>
        </div>
    )
}

export default Top
