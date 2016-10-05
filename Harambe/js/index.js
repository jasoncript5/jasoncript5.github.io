function quiz() {
  var question1 = prompt("Harambe is a...");
  if (question1 === "gorilla")
    alert("Well Done")
  else if (question1 === "Gorilla")
    alert("Well Done");
  else {
    alert("Wrong")
  };
  var question2 = prompt("Harambe was...");
  if (question2 === "Shot")
    alert("Well Done");
  else if (question2 === "shot")
    alert("Well Done");
  else {
    alert("wrong")
  }
  var question3 = prompt("What color is Harambe's Fur?")
  if (question3 === "Black")
    alert("Well Done")
  else if (question3 === "black")
    alert("Well Done")

  else {
    alert("Wrong")
  }
  var question4 = prompt("What Zoo did Harambe Live In? (Case Sensitive)")
  if (question4 === "Cincinnati Zoo")
    alert("Well Done")
  else {
    alert("Wrong")
  }
  var question5 = prompt("Do You Love Harambe?")
  if (question5 === "YES")
    alert("You are the best")
  else {
    alert("You don't deserve to live")
  }

}