import sbt._
import Keys._
import PlayProject._

object ApplicationBuild extends Build {

    val appName         = "jedemenalibanky.cz"
    val appVersion      = "1.0-SNAPSHOT"

    val appDependencies = Seq(
    	"commons-io" % "commons-io" % "2.4",
    	"com.google.code.morphia" % "morphia" % "0.99",
    	"com.google.code.morphia" % "morphia-logging-slf4j" % "0.99"
    )

    val main = PlayProject(appName, appVersion, appDependencies, mainLang = JAVA).settings(
      resolvers += "Morphia repository" at "http://morphia.googlecode.com/svn/mavenrepo/"
    )

}
