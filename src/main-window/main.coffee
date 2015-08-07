
module.exports =
class Main
  constructor: ->
    @element = document.createElement('div')
    @element.textContent = 'HELLO'

  getElement: ->
    @element
