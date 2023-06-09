import React, { Component } from "react";
import Navigation from "./components/Navigation/Navigation";
import FaceRecognition from "./components/FaceRecognition/FaceRecognition";
import ImageLinkForm from "./components/ImageLinkForm/ImageLinkForm";
import Signin from "./components/Signin/Signin";
import Register from "./components/Register/Register";
import Logo from "./components/Logo/Logo";
import Rank from "./components/Rank/Rank";
import "./App.css";
import ParticlesBg from "particles-bg";

const IMAGE_URL = "https://samples.clarifai.com/face-det.jpg";
const particlesOptions = {
  type: "square",
};

const initialState = {
  input: "",
  imageURL: "",
  box: {},
  route: "signin",
  isSignedIn: false,
  user: {
    id: "",
    name: "",
    email: "",
    entries: 0,
    joined: "",
  },
};

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined,
      },
    });
  };

  componentDidMount() {
    fetch("http://localhost:3002")
      .then((response) => response.json())
      .then(console.log);
  }

  calculateFaceLocation = (data) => {
    // boxes
    const clarifaiFace =
      data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById("inputImage");
    const width = Number(image.width);
    const height = Number(image.height);
    console.log(width, height);
    return {
      // box
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - clarifaiFace.right_col * width,
      bottomRow: height - clarifaiFace.bottom_row * height,
    };
  };

  displayFaceBox = (box) => {
    console.log("Box - ", box);
    this.setState({ box: box });
  };

  onInputChange = (event) => {
    // console.log(event.target.value);
    this.setState({ input: event.target.value });
  };

  //------------------------------------------------

  onButtonSubmitOld = () => {
    console.log("click - ", this.state.input);

    this.setState({ imageURL: this.state.input }, () => {
      console.log("URL2 - ", this.state.imageURL);
    });

    // console.log("URL - ", this.state.imageURL);

    //------------------------------------------------------

    const raw = JSON.stringify({
      user_app_id: {
        user_id: "bobgoblin",

        app_id: "face-recognition-test",
      },

      inputs: [
        {
          data: {
            image: {
              url: this.state.input,
            },
          },
        },
      ],
    });

    //----------------------------------------------------------
    console.log(raw);
    const requestOptions = {
      method: "POST",

      headers: {
        Accept: "application/json",

        Authorization: "Key " + "cbed232564d34a06805122d75e32337a",
      },

      body: raw,
    };
    console.log("requestoptions - ", requestOptions);
    fetch(
      `https://api.clarifai.com/v2/models/face-detection/outputs`,

      requestOptions
    )
      .then((response) => response.json())

      .then((result) => {
        // console.log(result.outputs[0].data.regions[0].region_info.bounding_box);
        console.log("result returned - ", result);
        if (result) {
          fetch("http://localhost:3002/image", {
            method: "put",

            headers: { "Content-Type": "application/json" },

            body: JSON.stringify({
              id: this.state.user.id,
            }),
          })
            .then((response) => response.json())

            .then((count) => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            })

            .catch(console.log);
        }
        console.log("result - ", result);
        this.displayFaceBox(this.calculateFaceLocation(result));
      })

      .catch((error) => console.log("error", error));
  };

  //-------------------------------------------------
  onButtonSubmit = () => {
    console.log("click - ", this.state.input);

    this.setState({ imageURL: this.state.input }, () => {
      console.log("URL2 - ", this.state.imageURL);
    });
    // New code;

    fetch("http://localhost:3002/imageurl", {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: this.state.input,
      }),
    })
      .then((response) => response.json())
      //------------------------------------------------------
      //comment from here
      .then((response) => {
        console.log("result returned - ", response);
        // console.log(result.outputs[0].data.regions[0].region_info.bounding_box);
        if (response) {
          fetch("http://localhost:3002/image", {
            method: "put",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: this.state.user.id,
            }),
          })
            .then((response) => response.json())
            .then((count) => {
              this.setState(Object.assign(this.state.user, { entries: count }));
            })
            .catch(console.log);
        }
        // console.log("result - ", result);
        this.displayFaceBox(this.calculateFaceLocation(response));
      })
      .catch((error) => console.log("error", error));
  };
  //------------------------------------------------------

  onRouteChange = (route) => {
    if (route === "signout") {
      this.setState(initialState);
    } else if (route === "home") {
      this.setState({ isSignedIn: true });
    }
    this.setState({ route: route });
  };

  render() {
    return (
      <div className="App">
        <ParticlesBg className="particles" type="circle" bg={true} />
        <Navigation
          isSignedIn={this.state.isSignedIn}
          onRouteChange={this.onRouteChange}
        />
        {this.state.route === "home" ? (
          <div>
            <Logo />
            <Rank
              name={this.state.user.name}
              entries={this.state.user.entries}
            />

            <ImageLinkForm
              onInputChange={this.onInputChange}
              onButtonSubmit={this.onButtonSubmit}
            />
            <FaceRecognition
              box={this.state.box}
              imageURL={this.state.imageURL}
            />
          </div>
        ) : this.state.route === "signin" ? (
          <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange} />
        ) : (
          <Register
            loadUser={this.loadUser}
            onRouteChange={this.onRouteChange}
          />
        )}
      </div>
    );
  }
}

export default App;
