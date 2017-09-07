Feature: Sociogram Interface

  Scenario: User puts a new node on the Sociogram
    When User drops a Node from the Bucket onto the Sociogram
    Then Node should be positioned on the Sociogram
